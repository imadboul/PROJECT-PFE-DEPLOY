from rest_framework import serializers
from .models import Invoice,InvoiceLine
from user.models import Client
from order_client.serializers import contractSerializerOne
from catalog.models import ProductType
from Orders_Manage.serializers import OrderInvoicesSerializer
from django.db import transaction
from Orders_Manage.models import Order
from .models import StatesInv
from Tax_Service.taxCalcul import facturation
from catalog.models import Contract
from Tax_Service.serilazers import get_now

class InvoiceLineFilterSerializer(serializers.ModelSerializer):
    product=serializers.CharField(source='product.name')
    class Meta:
        model=InvoiceLine
        fields=['id','tax_name','product','qte','unit','tax_price','Tva']
        
class InvoiceFilterSerializerOne(serializers.ModelSerializer):
    invoice_InvoiceLine_items=InvoiceLineFilterSerializer(many=True)
    contract_type=serializers.CharField(source='contract.name',read_only=True)
    client_firstName=serializers.CharField(source='contract.client.firstName',read_only=True)
    client_lastName=serializers.CharField(source='contract.client.lastName',read_only=True)
    invoice_order_items=OrderInvoicesSerializer(many=True)
    validated_by=serializers.SerializerMethodField()
    def get_validated_by(self,obj):
        return obj.validated_by.firstName if obj.validated_by else None
        
    class Meta:
        model=Invoice
        fields=['id','client_firstName','client_lastName','contract_type','type','states','date_de_facteration','validated_by','HT','TVA','TTC','invoice_InvoiceLine_items','invoice_order_items']


# pour la validation des facteurs 
class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model=ProductType
        fields=['id','name']

class clientSerializerOne(serializers.ModelSerializer):
    client_contracts=contractSerializerOne(many=True)
    client_firstName=serializers.CharField(source='firstName',read_only=True)
    client_lastName=serializers.CharField(source='lastName',read_only=True)
    class Meta:
        model=Client
        fields=['id','client_firstName','client_lastName','client_contracts']
        

    

class vlaidatedInvoiceSerializerOne(serializers.Serializer):
    ids=serializers.ListField(child=serializers.IntegerField(),allow_empty=False) 
    

class InvoicedOrNewInvoiceSerializer(serializers.Serializer):
    ids=serializers.ListField(child=serializers.IntegerField(),allow_empty=False) 
    contract=serializers.IntegerField()
    invoice_id=serializers.IntegerField()
    @transaction.atomic
    def create(self, validated_data,*args, **kwargs):
        user=self.context.get('user')
        invoice_type = self.context.get('invoice_type')
        contract=Contract.objects.filter(id=validated_data['contract']).first()
        new_invoice=Invoice.objects.create(contract=contract , states=StatesInv.NO_VALID )
        
        Order.objects.filter(id__in=validated_data['ids']).update(invoice=new_invoice)
    
        if invoice_type=="invoiced":
            
            orders=Order.objects.filter(id__in=validated_data['ids'])
            facturation(orders)
            Invoice.objects.filter(id=new_invoice).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
            
        elif invoice_type=="new_invoice":
            
            orders=Order.objects.filter(invoice=validated_data['invoice_id'])
            facturation(orders)
            Invoice.objects.filter(id=validated_data['invoice_id']).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
        else:
            
            raise serializers.ValidationError(" error invoice type not exist in url ")
        
        return new_invoice
      
