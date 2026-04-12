from django.contrib import admin 
from .models import Invoice,InvoiceLine
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display=['id','contract','type','states','date_de_facteration','validated_by','HT','TVA','TTC']
    
@admin.register(InvoiceLine)
class InvoiceLineAllInfoAdmin(admin.ModelAdmin):
    list_display=['id','invoice','product_name','tax_name','qte','unit','tax_price']    
