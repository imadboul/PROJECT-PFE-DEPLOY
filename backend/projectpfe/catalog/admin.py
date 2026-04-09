from django.contrib import admin
from .models import *


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'start_date', 'end_date','product_type')
    
@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'unit_price','unit','qte_left','product_type')
    
