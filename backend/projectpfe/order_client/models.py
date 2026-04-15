from django.db import models
from catalog.models import Contract,Client,Product
from decimal import Decimal
from catalog.models import ProductUnit
class States(models.TextChoices):
    
       PENDING='pending','Pending'
       VALID='validated','Validated'
       REJECT='rejected','Rejected'    

    

class Orderclient(models.Model):
    id=models.AutoField(primary_key=True)
    date_created=models.DateTimeField(auto_now_add=True)
    contract=models.ForeignKey(Contract,related_name='contract_Orderclient_items',null=False,blank=False,on_delete=models.PROTECT)
    client=models.ForeignKey(Client,related_name='client_Ordersclient_items',null=False,blank=False,on_delete=models.PROTECT)
    state=models.CharField(choices=States.choices,max_length=20,default=States.PENDING)
    validated_by = models.ForeignKey(Client,null=True,on_delete=models.PROTECT)
    pickup_date = models.DateField(null=True)
    
 
class OrderProductclient(models.Model):
    
    id=models.AutoField(primary_key=True)
    order=models.ForeignKey(Orderclient,related_name='orderclient_Orderproductclient_items',null=False,blank=False,on_delete=models.PROTECT)
    product=models.ForeignKey(Product,related_name='product_OrderProductclient_items',null=False,blank=False,on_delete=models.PROTECT)
    qte=models.DecimalField(null=False,blank=False,max_digits=12,decimal_places=3)
    qte_taken = models.DecimalField(max_digits=12,decimal_places=3,default=Decimal('0'))
    unit=models.CharField(null=False,blank=False,choices=ProductUnit,max_length=20) 



