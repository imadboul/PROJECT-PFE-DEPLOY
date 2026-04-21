from Tax_Service.taxCalcul import convert_unit
from .models import *


     
def total_priceobject(ordersProduct):
        
        TTC=0
        for orderProduct in ordersProduct:
            Tva=0
            taxActiv=[]
            
            for tax in orderProduct.product.product_taxProduct_items.all():
            
                if tax.is_active==True and tax.tax.name!="TVA":
                    taxActiv.append({  "name":tax.tax.name , "unit":tax.unit , "par_unit":tax.par_unit })
                    
                elif tax.is_active==True and tax.tax.name=="TVA":
                     Tva=tax.par_unit
        
            
            TTC+=tax_priceobject(taxActiv,orderProduct,Tva)
        
        return TTC     
              
            
        
    
def tax_priceobject(taxActiv,orderProduct,Tva):
        
        
        total_tax=0 
        
        
        
        for tax in taxActiv:
            
            unit_l=convert_unit(orderProduct.qte,orderProduct.product.density,orderProduct.unit,tax['unit'])
                    
            tax_price=unit_l*tax['par_unit']
            
            total_tax+=tax_price 
               
           
       
        qte_unit=convert_unit(orderProduct.qte,orderProduct.product.density,orderProduct.unit,orderProduct.product.unit) 
        
        TTC=((qte_unit*orderProduct.product.unit_price)+total_tax)*(1+Tva/100)
        
        
        return TTC  
    
    
    
    
    



     
def total_price(ordersProduct):
        print('in this one')
        
        TTC=0
        for orderProduct in ordersProduct:
            Tva=0
            taxActiv=[]
            
            product = orderProduct.get('product')
            for tax in product.product_taxProduct_items.all():
            
                if tax.is_active==True and tax.tax.name!="TVA":
                    taxActiv.append({  "name":tax.tax.name , "unit":tax.unit , "par_unit":tax.par_unit })
                    
                elif tax.is_active==True and tax.tax.name=="TVA":
                     Tva=tax.par_unit
        
            
            TTC+=tax_price(taxActiv,orderProduct,Tva)
        print(TTC)
        return TTC     
              
            
        
    
def tax_price(taxActiv,orderProduct,Tva):
        print('jjj')
        
        total_tax=0 
        
        product = orderProduct.get('product')
        
        for tax in taxActiv:
            
            
            unit_l=convert_unit(orderProduct.get('qte'),product.density,orderProduct.get('unit'),tax['unit'])
                    
            tax_price=unit_l*tax['par_unit']
            
            total_tax+=tax_price 
               
           
        
        qte_unit=convert_unit(orderProduct.get('qte'),product.density,orderProduct.get('unit'),product.unit) 
        
        
        TTC = ((qte_unit * product.unit_price) + total_tax) * (Decimal("1") + Decimal(str(Tva)) / Decimal("100"))
        
        
        
        return TTC  
    
    