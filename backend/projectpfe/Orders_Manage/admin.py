from django.contrib import admin
from .models import Order,OrderProduct

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display=['id','client','contract','parent_order','type','states','date_created']

@admin.register(OrderProduct)
class OrderProductAdmin(admin.ModelAdmin):
    list_display=['id','order','product','type','qte','unit','states']
