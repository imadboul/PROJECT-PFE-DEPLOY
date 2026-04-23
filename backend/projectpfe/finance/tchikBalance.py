from django.db.models import F
from Orders_Manage.models import States
from Invoices.models import InvoiceLine,Invoice
from finance.models import Balance
from django.db.models import Case, When, F, Value, DecimalField
from collections import defaultdict
import logging
from django.db import connection
from decimal import Decimal
from django.db.models import Prefetch
from Orders_Manage.models import *
from .models import TaxProduct
logging=logging.getLogger(__name__)

from django.db import transaction
from django.db.models import Case, When, F, Value, DecimalField
from collections import defaultdict
    


def minus_balances(ordersValidated):
        
        invoices=[]
        invoicesLins=[]
        order_facteurs=[]
        orders = ordersValidated.prefetch_related(
    'order_orderProduct_items__product__product_taxProduct_items__tax',
    

    Prefetch(
        'client__client_balances',
        to_attr='pref_balances'
    ),
     Prefetch(
        'contract__product_type__balances',
        to_attr='pref_type'
    ),
    

    Prefetch(
        'invoice__invoice_InvoiceLine_items',
        to_attr='pref_lines'
    ),

).select_related(
    'invoice',
    'contract',
    'contract__client',
    'contract__product_type'
    
)      
        product_type_map = {}
        client_balance_map = {}
        invoiceLins_map={}
        for order in orders:
            
            order_facteurs.append(order.id)
            
            invoiceLins_map[order.invoice_id] = list ( order.invoice.pref_lines  )
            
            client_balance_map[order.client_id]=list( order.client.pref_balances)
            
            product_type_map[order.contract.product_type_id]=list(order.contract.product_type.pref_type)
            
            
            items1=client_balance_map.get(order.client.id,[])
            items2=product_type_map.get(order.contract.product_type.id,[])
            
            for item1 in items1:
              for item2 in items2:
                  if (item1.id==item2.id):
                      blc_id=item1.id 
                
              
            
             
            HT, TVA, TTC = total_price( order.order_orderProduct_items.all() ,invoicesLins )
            
            invoices.append({
                "invoice": order.invoice,
                "blc_id":blc_id,
                "HT": HT,
                "TVA": TVA,
                "TTC": TTC
            })
                
        update_or_save_invoiceLins(invoicesLins,invoiceLins_map )
        print("123456") 
        update_invoices_bulk(invoices)
        Order.objects.filter(id__in=order_facteurs).update(states=States.INVOICED)
        print(len(connection.queries))
        
        
        
        
        
        
                   
   
      
def total_price(ordersProduct, invoicesLins):
        
        HT,TVA,TTC=0,0,0
        for orderProduct in ordersProduct:
            Tva=0
            taxActiv=[]
            
            for tax in orderProduct.product.product_taxProduct_items.all():
            
                if tax.is_active==True and tax.tax.name!="TVA":
                    taxActiv.append({  "name":tax.tax.name , "unit":tax.unit , "par_unit":tax.par_unit })
                    
                elif tax.is_active==True and tax.tax.name=="TVA":
                     Tva=tax.par_unit
        
            
            X,Y,Z=tax_price(taxActiv,orderProduct,Tva,invoicesLins)
    
            HT+=X
            TVA+=Y  
            TTC+=Z   
            
        return HT,TVA,TTC
    
    
def tax_price(taxActiv,orderProduct,Tva,invoicesLins):
        
        
        total_tax=0 
        
        type=orderProduct.order.type
        
        
        for tax in taxActiv:
            
            unit_l=convert_unit(orderProduct.qte,orderProduct.product.density,orderProduct.unit,tax['unit'])
                    
            tax_price=unit_l*tax['par_unit']
            
            total_tax+=tax_price 
               
            if(type=='minus'):
                 additional_taxPrice_qte(orderProduct.order.invoice,invoicesLins,orderProduct.product,orderProduct.qte*-1,orderProduct.unit,tax_price*-1,tax['name'],Tva)
            else:
                  additional_taxPrice_qte(orderProduct.order.invoice,invoicesLins,orderProduct.product,orderProduct.qte,orderProduct.unit,tax_price,tax['name'],Tva)        
                    
       
        qte_unit=convert_unit(orderProduct.qte,orderProduct.product.density,orderProduct.unit,orderProduct.product.unit) 
        
        HT=(qte_unit*orderProduct.product.unit_price)
        TTC=(HT+total_tax)*(Decimal("1")+Decimal(str(Tva))/Decimal("100"))
        TVA=(HT+total_tax)*Tva/100
        
        if(type == 'minus'):  
            HT*=-1 
            TVA*=-1 
            TTC*=-1
        
        
        return HT,TVA,TTC
    
    
  
     

def additional_taxPrice_qte(invoice,invoicesLines,product,qte,unit,tax_price,tax_name,Tva):
    
    invoicesLines.append({
        "invoice":invoice,
        "product":product,
        "qte":qte,
        "unit":unit,
        "tax_price":tax_price,
        "tax_name":tax_name,
        "Tva":tax_price*Decimal(str(Tva))/Decimal("100")
    })

  
 
        




def convert_unit( qte,density,source_unit ,target_unit):
    
    
    
    
    if source_unit == target_unit:
        return qte
    
   
    
    if source_unit == 'L':
        qte_l = qte
    elif source_unit == 'HL':
        qte_l = qte * 100
    elif source_unit == 'KG':
        qte_l = qte / density
    elif source_unit == 'TM':
        qte_l = (qte * 1000) / density
    else:
        raise Exception(f"unsupported source unit: {source_unit}")


    if target_unit == 'L':
        return qte_l
    elif target_unit == 'HL':
        return qte_l / 100
    elif target_unit == 'KG':
        return qte_l * density
    elif target_unit == 'TM':
        return (qte_l * density) / 1000
    else:
        raise Exception(f"unsupported target unit: {target_unit}")    
    
      


def update_invoices_bulk(invoicesFinal):
    
  
    grouped = defaultdict(lambda: {"HT": 0, "TVA": 0, "TTC": 0})
    
   
        
       
        
        
    
    
    for item in invoicesFinal:
        invoice_id=item['invoice'].id
        grouped[invoice_id]["HT"] += item["HT"]
        grouped[invoice_id]["TVA"] += item["TVA"]
        grouped[invoice_id]["TTC"] += item["TTC"]


    ids_invoices = list(grouped.keys())

    
    balance_grouped = defaultdict(lambda: {'TTC':0})

    for item in invoicesFinal:
        
        balance_grouped[item['blc_id']]['TTC']+=item['TTC']
    
    ids_balance=list(balance_grouped.keys())
    
    
    
    
    blc_case = Case(
        *[
            When(id=blc_id, then=F("amount") - Value(data['TTC']))
            for blc_id, data in balance_grouped.items()
        ],
        output_field=DecimalField()
    )
    
    ht_case = Case(
        *[
            When(id=inv_id, then=F("HT") + Value(data["HT"]))
            for inv_id, data in grouped.items()
        ],
        output_field=DecimalField()
    )

    tva_case = Case(
        *[
            When(id=inv_id, then=F("TVA") + Value(data["TVA"]))
            for inv_id, data in grouped.items()
        ],
        output_field=DecimalField()
    )

    ttc_case = Case(
        *[
            When(id=inv_id, then=F("TTC") + Value(data["TTC"]))
            for inv_id, data in grouped.items()
        ],
        output_field=DecimalField()
    )
    
    
    Invoice.objects.filter(id__in=ids_invoices).update( HT=ht_case , TVA=tva_case , TTC=ttc_case )
    Balance.objects.filter(id__in=ids_balance).update( amount=blc_case )

    
    
def update_or_save_invoiceLins(invoicesLins, invoice_map ):
     
     grouped_update = defaultdict(lambda: {"qte":0,"tax_price":0,"Tva":0,"unit":None})
     grouped_save= defaultdict(lambda: {"qte":0,"unit":None,"tax_price":0,"Tva":Decimal("0")})
    
     for item in invoicesLins:
        
        inv_id = item["invoice"]  

        lines = invoice_map.get(inv_id.id, [])

        found = None
        
        for line in lines:
            
            if line.tax_name == item["tax_name"] and line.product.name == item["product"].name:
                
                found = line
                break
        
        if found:
            
                convert_qte=convert_unit(item["qte"],line.product.density,item["unit"],line.unit)
                grouped_update[found.id]["qte"] += convert_qte
                grouped_update[found.id]["tax_price"] += item["tax_price"]
                grouped_update[found.id]["Tva"]+=item["Tva"]
        else:
            
            key = (inv_id, item["product"], item["tax_name"])
            grouped_save[key]["qte"] += item["qte"]
            grouped_save[key]["tax_price"] += item["tax_price"]
            grouped_save[key]["unit"] = item["unit"]
            grouped_save[key]["Tva"]+= item["Tva"]
            
           
        
     
     if grouped_update:

        to_update_ids = list(grouped_update.keys())
    
        qte_case = Case(
            *[
                When(id=cle, then=F("qte")+Value(data["qte"]))
                for cle, data in grouped_update.items()
            ],
            output_field=DecimalField()
        )
    
        tax_price_case = Case(
            *[
                When(id=cle, then=F("tax_price")+Value(data["tax_price"]))
                for cle, data in grouped_update.items()
            ],
            output_field=DecimalField()
        )
        
        Tva_case = Case(
            *[
                When(id=cle, then=F("Tva")+Value(data["Tva"]))
                for cle, data in grouped_update.items()
            ],
            output_field=DecimalField()
        )
        
        
    
        InvoiceLine.objects.filter(id__in=to_update_ids).update( qte=qte_case , tax_price=tax_price_case , Tva=Tva_case )
     
     if grouped_save:
         to_save=[]
         for (invoice, product, tax_name), data in grouped_save.items():
            print("nnnn") 
            to_save.append(InvoiceLine(
                invoice=invoice,
                product=product,
                tax_name=tax_name,
                qte=data["qte"],
                tax_price=data["tax_price"],
                unit=data["unit"],
                Tva=data["Tva"]
            ))             
         InvoiceLine.objects.bulk_create(to_save)
         
    
    
            


       


