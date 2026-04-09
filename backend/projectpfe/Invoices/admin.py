from django.contrib import admin 
from .models import Invoice,InvoiceLineAllInfo
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display=['id','contract','type','states','date_de_facteration','HT','TVA','TTC']
    
@admin.register(InvoiceLineAllInfo)
class InvoiceLineAllInfoAdmin(admin.ModelAdmin):
    list_display=['id','invoice','product_name','tax_name','qte','unit','tax_price']    
