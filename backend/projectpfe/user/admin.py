from django.contrib import admin

from .models import *

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'firstName', 'email','lastName')
    

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id','user','title','content','viewed' ,'link','date'   )
    