from django.db.models import F
from Orders_Manage.models import States
from Invoices.models import InvoiceLine,Invoice
from finance.models import Balance
from django.db.models import Case, When, F, Value, DecimalField
from collections import defaultdict
import logging
logging=logging.getLogger(__name__)

def mains_balances(ordersValidated):
        
        
        
        
        
        invoices=[]
        invoicesLins=[]
        
        for order in ordersValidated:
            HT, TVA, TTC = total_price( order.order_orderProduct_items.all() ,invoicesLins )
        
            invoices.append({
                "invoice": order.invoice,
                "HT": HT,
                "TVA": TVA,
                "TTC": TTC
            })
        
        update_invoices_bulk(invoices)
        
        
        
        
        
        
        
        
                   
   
      
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
        
        
        for tax in taxActiv:
            
            match tax['unit']:
              
                case 'L':
                    
                    unit_l=unitchange(orderProduct,'L')
                    
                    tax_price=unit_l*tax['par_unit']
                    
                    total_tax+=tax_price    
                    if(orderProduct.order.type=='mains'):
                         additional_taxPrice_qte(orderProduct.order.invoice,invoicesLins,orderProduct.product.name,orderProduct.qte*-1,orderProduct.unit,tax_price*-1,tax['name'])
                    else:
                          additional_taxPrice_qte(orderProduct.order.invoice,invoicesLins,orderProduct.product.name,orderProduct.qte,orderProduct.unit,tax_price,tax['name'])
       
        qte_unit=unitchange(orderProduct,orderProduct.product.unit) 
        
        HT=(qte_unit*orderProduct.product.unit_price)
        
        TTC=(HT+total_tax)*(1+Tva/100)
        TVA=(HT+total_tax)*Tva/100
        if(orderProduct.order.type== 'mains'):
            HT*=-1
            TVA*=-1
            TTC*=-1
        
        
        return HT,TVA,TTC
    
    
  
     

def additional_taxPrice_qte(invoice,invoicesLine,product_name,qte,unit,tax_price,tax_name):
    
    invoicesLine.append({
        "invoice":invoice,
        "product_name":product_name,
        "qte":qte,
        "unit":unit,
        "tax_price":tax_price,
        "tax_name":tax_name
    })

  
 
        


def unitchange(orderProduct,unit):
    
    
    
    if (unit==orderProduct.unit):
        return orderProduct.qte
  
    match unit:
        case 'L':
            match orderProduct.unit:
                case 'HL':
                    return orderProduct.qte*100
                case 'KG':
                    return orderProduct.qte/orderProduct.product.density
                case 'TM':
                    return orderProduct.qte*1000/orderProduct.product.density
        case 'HL':
            match orderProduct.unit:
                case 'L':
                    return orderProduct.qte/100
                case 'KG':
                    return orderProduct.qte/100*orderProduct.product.density
                case 'TM':
                    return orderProduct.qte*10/orderProduct.product.density
        case 'KG':
            match orderProduct.unit:
                case 'L':
                    return orderProduct.qte*orderProduct.product.density
                case 'HL':
                    return orderProduct.qte*100*orderProduct.product.density
                case 'TM':
                    return orderProduct.qte*1000 
        case 'TM':
            match orderProduct.unit:
                case 'KG':
                    return orderProduct.qte/1000
                case 'HL':
                    return orderProduct.qte*orderProduct.product.density/10
                case 'L':
                    return orderProduct.qte*orderProduct.product.density/1000      
        


    
    
      


def update_invoices_bulk(invoicesFinal):
    
    grouped = defaultdict(lambda: {"blc_id":None,"HT": 0, "TVA": 0, "TTC": 0})
    
    
    for item in invoicesFinal:
        inv = item["invoice"]
        contract = inv.contract
        client = contract.client
        product_type = contract.product_type

        blc = next(
            (b for b in client.client_balances.all()
             if b.productType_id == product_type.id),
            None
        )

        inv_id = inv.id

        if blc:
            grouped[inv_id]["blc_id"] = blc.id

        grouped[inv_id]["HT"] += item["HT"]
        grouped[inv_id]["TVA"] += item["TVA"]
        grouped[inv_id]["TTC"] += item["TTC"]


    ids = list(grouped.keys())
    
    
    
    
    balance_grouped = defaultdict(lambda: 0)

    for data in grouped.values():
        if data["blc_id"] is not None:
            balance_grouped[data["blc_id"]] += data["TTC"]

    blc_case = Case(
        *[
            When(id=blc_id, then=F("amount") - Value(total_ttc))
            for blc_id, total_ttc in balance_grouped.items()
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
    blc_case = Case(
        *[
            When(id=blc_id, then=F("amount") - Value(total_ttc))
            for blc_id, total_ttc in balance_grouped.items()
        ],
        output_field=DecimalField()
    )
    
    Invoice.objects.filter(id__in=ids).update( HT=ht_case , TVA=tva_case , TTC=ttc_case )
    Balance.objects.filter(id__in=balance_grouped.keys()).update( amount=blc_case )
    
    
    