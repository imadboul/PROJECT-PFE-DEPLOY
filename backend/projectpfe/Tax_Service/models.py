from django.db import models
from catalog.models import Product

class TaxUnit(models.TextChoices):
    KG='Kg'
    HL='Hl'
    TM='Tm'
    L='l'
    PR='%'
class Tax(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(null=False,blank=False,max_length=100)
    
    def __str__(self):
        return self.name
    
    
class TaxProduct(models.Model):
    id=models.AutoField(primary_key=True)
    tax=models.ForeignKey(Tax,related_name='tax_taxProduct_items',on_delete=models.PROTECT)
    product=models.ForeignKey(Product,related_name='product_taxProduct_items',on_delete=models.PROTECT)
    start_date=models.DateTimeField(auto_now_add=True)
    end_date=models.DateTimeField(null=True,blank=True)
    unit=models.CharField(choices=TaxUnit.choices,null=False,blank=False,max_length=20)
    par_unit=models.DecimalField(decimal_places=3,max_digits=6,null=False,blank=False)
    is_active=models.BooleanField(null=False,blank=False,default=True)
    
    def __str__(self):
        return f"{self.tax.name} - {self.product.name}"