from django.db import models
from Orders_Manage.models import Types,OrderProduct
from catalog.models import Contract,Product
from Tax_Service.models import TaxProduct
from user.models import Client
class StatesInv(models.TextChoices):
    VALID='validated','Validated'
    NO_VALID='pending','Pending'


class Invoice(models.Model):
    id=models.AutoField(primary_key=True)
    date_de_facteration=models.DateTimeField(null=True)
    contract=models.ForeignKey(Contract,related_name='contract_invoice_items',null=False,blank=False,on_delete=models.PROTECT)
    type=models.CharField(choices=Types.choices,max_length=20,default=Types.NORMAL)
    states=models.CharField(choices=StatesInv.choices, default=StatesInv.NO_VALID,max_length=20)
    HT=models.DecimalField(decimal_places=2,max_digits=12,null=False,blank=False,default=0)
    TVA=models.DecimalField(decimal_places=2,max_digits=12,null=False,blank=False,default=0)
    TTC=models.DecimalField(decimal_places=2,max_digits=12,null=False,blank=False,default=0)
    validated_by = models.ForeignKey(Client ,on_delete=models.SET_NULL,related_name="client_invoice_items",null=True)
    
    
    
class InvoiceLine(models.Model):
    id=models.AutoField(primary_key=True)
    invoice=models.ForeignKey(Invoice,related_name='invoice_InvoiceLine_items',null=False,blank=False,on_delete=models.PROTECT)
    product=models.ForeignKey(Product,null=False,blank=False,related_name='product_InvoiceLine_items',on_delete=models.PROTECT)
    tax_name=models.CharField(max_length=50,null=False,blank=False)
    qte=models.DecimalField(decimal_places=2,max_digits=12,null=False,blank=False,default=0)
    unit=models.CharField(null=False,blank=False,choices=[('L', 'Liter'),('HL', 'Hectoliter'),('KG', 'Kilogram'),('TM', 'Ton')],max_length=20)
    tax_price=models.DecimalField(decimal_places=2,max_digits=12,null=False,blank=False)