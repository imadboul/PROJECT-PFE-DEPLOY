from django.db import models
from Orders_Manage.models import Types,OrderProduct
from catalog.models import Contract
from Tax_Service.models import TaxProduct

class States(models.TextChoices):
    VALID='valid','Valid'
    NO_VALID='no_valid','No_Valid'


class Invoice(models.Model):
    id=models.AutoField(primary_key=True)
    date_creat=models.DateTimeField(auto_now_add=True)
    contract=models.ForeignKey(Contract,related_name='contract_invoice_items',null=False,blank=False,on_delete=models.PROTECT)
    type=models.CharField(choices=Types.choices,max_length=20)
    states=models.CharField(choices=States.choices, default=States.NO_VALID,max_length=20)
    
    
    
class InvoiceLine(models.Model):
    id=models.AutoField(primary_key=True)
    tax_product=models.ForeignKey(TaxProduct,related_name='tax_product_items',null=False,blank=False,on_delete=models.PROTECT)
    order_product=models.ForeignKey(OrderProduct,related_name='order_product_items',null=False,blank=False,on_delete=models.PROTECT)
    tax_prix=models.DecimalField(decimal_places=2,max_digits=12,null=False,blank=False)
    TVA_prix=models.DecimalField(decimal_places=2,max_digits=12,null=False,blank=False)