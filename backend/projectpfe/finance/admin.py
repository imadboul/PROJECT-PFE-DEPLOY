from django.contrib import admin
from .models import *


@admin.register(Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'productType', 'amount')
    
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'productType', 'amount', 'bankName', 'state', 'transferDate')
    

