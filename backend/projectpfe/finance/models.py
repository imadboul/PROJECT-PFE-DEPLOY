from django.db import models
from user.models import Client
from catalog.models import ProductType
from decimal import Decimal
class Balance(models.Model):
    id = models.AutoField
    client = models.ForeignKey(Client , on_delete=models.CASCADE,related_name='balances')
    productType = models.ForeignKey(ProductType, on_delete= models.CASCADE, related_name='balances')
    amount = models.DecimalField(max_digits=12, decimal_places=2, default= Decimal('0'))
    
    
    class Meta:
        unique_together = ('client', 'productType')
        
    def __str__(self):
        return f"balance of {self.client} for {self.productType}"
    
    
class Payment(models.Model):
    STATES = [
        ("pending", "Pending"),
        ("validated", "Validated"),
        ("rejected", "Rejected"),
    ]
    
    
    id = models.AutoField(primary_key=True)
    client = models.ForeignKey(Client,on_delete=models.SET_NULL,related_name='payments',null=True)
    productType = models.ForeignKey(ProductType,on_delete=models.CASCADE,related_name='payments', db_index=True)
    transferDate = models.DateField(null=False, db_index=True) ## YYYY-MM-DDTHH:MM:SSZ ex:"2026-04-02T14:30:00Z"
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    bankName = models.CharField(max_length=254)
    state = models.CharField(max_length=20,choices=STATES,default="pending", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    validated_by = models.ForeignKey(Client ,on_delete=models.SET_NULL,related_name="validated_payments",null=True)
    
    def __str__(self):
        return f'payment of {self.client} ({self.state})'
    