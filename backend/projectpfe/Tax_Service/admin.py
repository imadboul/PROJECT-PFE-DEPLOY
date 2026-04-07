from django.contrib import admin
from .models import Tax,TaxProduct
@admin.register(Tax)
class TaxAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
@admin.register(TaxProduct)    
class TaxProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'tax', 'product', 'start_date', 'end_date', 'unit', 'par_unit', 'is_active']
