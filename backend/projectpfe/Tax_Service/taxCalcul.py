from django.db.models import F
from Orders_Manage.models import States
from Invoices.models import InvoiceLine,Invoice
import logging
logging=logging.getLogger(__name__)

def mains_balances(ordersValidated):
    try:     
        for order in ordersValidated:
            invoice=order.invoice
            ordersProduct=order.order_orderProduct_items.all()
            HT,TVA,TTC=total_price(ordersProduct,invoice) # order لكل  TTC السعر الكلي 
            order.client.client_balances.filter(productType=order.contract.product_type).update(amount=F('amount')-TTC)
            
            if order.parent_order is not None  and order.parent_order.invoice.states==States.VALID:
                
                Invoice.objects.filter(id=invoice.id).update(HT=F('HT')+HT,TVA=F('TVA')+TVA,TTC=F('TTC') + TTC,states=States.VALID)
            else:
                Invoice.objects.filter(id=invoice.id).update(HT=F('HT')+HT,TVA=F('TVA')+TVA,TTC=F('TTC') + TTC)
                   
    except Exception as e:
        
        raise Exception(str(e))  
    
      
def total_price(ordersProduct,invoice):
    try:     
        HT,TVA,TTC=0,0,0
        for orderProduct in ordersProduct:
            taxs=orderProduct.product.product_taxProduct_items.filter(is_active=True )
            X,Y,Z=tax_price(taxs,orderProduct,invoice) # orderProduct لكل  TTC السعر الكلي
    
            HT+=X
            TVA+=Y  
            TTC+=Z   
            
        return HT,TVA,TTC
    except Exception as e:
       
        raise Exception(str(e))
    
def tax_price(taxs,orderProduct,invoice):
    try:
        
        
          
        total_tax=0 
        tva=taxs.filter(tax__name='TVA').first()
        taxs_ne_tva=taxs.exclude(tax__name='TVA')
        for tax in taxs_ne_tva:
            match tax.unit:
                case 'l':
                    unit_l=unitchange(orderProduct,'l')
                    tax_price=unit_l*tax.par_unit
                    total_tax+=tax_price    
                    if(orderProduct.order.type=='mains'):
                         additional_taxPrice_qte(invoice,orderProduct.product.name,orderProduct.qte*-1,orderProduct.unit,tax_price*-1,tax.tax.name)
                    else:
                          additional_taxPrice_qte(invoice,orderProduct.product.name,orderProduct.qte,orderProduct.unit,tax_price,tax.tax.name)
        qte_unit=unitchange(orderProduct.qte,orderProduct.unit,tva.product.unit) # type: ignore
        HT=(qte_unit*orderProduct.product.unit_price)
        TTC=(HT+total_tax)*(1+tva.par_unit/100)
        TVA=(HT+total_tax)*tva.par_unit/100
        if(orderProduct.order.type== 'mains'):
            HT*=-1
            TVA*=-1
            TTC*=-1
        
        
        return HT,TVA,TTC
    
    
    except Exception as e:
        logging.error(f"Error in tax_price function: {str(e)}")
        raise Exception(str(e))
    
     

def additional_taxPrice_qte(invoice,product_name,qte,unit,tax_price,tax_name):
    try:
 
        tax_price_qte=invoice.invoice_InvoiceLine_items.filter(product_name=product_name,tax_name=tax_name)
        if tax_price_qte.exists():
                tax_price_qte.update(tax_price=F('tax_price')+tax_price,qte=F('qte')+qte)
        else:           
            InvoiceLine.objects.create(
                invoice=invoice,
                product_name=product_name,
                qte=qte,
                unit=unit,
                tax_price=tax_price,
                tax_name=tax_name
            )  
    except Exception as e:
        logging.error(f"Error in additional_taxPrice_qte function: {str(e)}")
        raise Exception(str(e))


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
        
    

