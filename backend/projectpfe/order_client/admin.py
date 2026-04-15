from django.contrib import admin
from .models import *



@admin.register(Orderclient)
class OrderAdmin(admin.ModelAdmin):
    list_display=['id','client','contract','state','date_created']

@admin.register(OrderProductclient)
class OrderProductAdmin(admin.ModelAdmin):
    list_display=['id','order','product','qte']