from django.db import models
from user.models import Client
from decimal import Decimal

class ProductType(models.Model):

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=254, unique=True)
    description = models.TextField(blank=True,null=True)
    
    def __str__(self):
        return self.name
    
    
class Product(models.Model):
    STATES = [
        ("litre", "Litre"),
        ("kg", "Kilo Gram"),
    ]
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=254, unique=True)
    description = models.TextField(blank=True, null=True)
    unit_price = models.DecimalField(max_digits=12,decimal_places=2)
    unit = models.CharField(max_length=20,choices=STATES,default='kg', db_index=True)
    density = models.DecimalField(max_digits=10,decimal_places=3,null=True,blank=True, default=Decimal('0'))
    product_type = models.ForeignKey(ProductType, on_delete= models.CASCADE,related_name='products')
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return f'{self.name}'
    
    
    
    
    
    
    
class Contract(models.Model):
    STATES = [
        ("pending", "Pending"),
        ("validated", "Validated"),
        ("rejected", "Rejected"),
    ]
    
    
    id = models.AutoField(primary_key=True)
    start_date = models.DateTimeField(null=False, db_index=True) ## YYYY-MM-DDTHH:MM:SSZ ex:"2026-04-02T14:30:00Z"
    end_date = models.DateTimeField(null=False)
    qte_global = models.DecimalField(null=False,blank=False,max_digits=12,decimal_places=3)
    qte_used = models.DecimalField(max_digits=12,decimal_places=3,default=Decimal('0'))
    created_at = models.DateTimeField(auto_now_add=True)
    validated_at = models.DateTimeField(null=True)
    state = models.CharField(max_length=20,choices=STATES,default="pending", db_index=True)
    validated_by = models.ForeignKey(Client ,on_delete=models.SET_NULL,related_name="validated_contracts",null=True)
    client = models.ForeignKey(Client,on_delete=models.SET_NULL,related_name='client_contracts',null=True)
    product_type = models.ForeignKey(ProductType,on_delete=models.CASCADE,related_name='contracts')
    
    def __str__(self):
        return f'contract of {self.client} ({self.state})'
    def qte_rest(self):
        return (self.qte_global - self.qte_used)
