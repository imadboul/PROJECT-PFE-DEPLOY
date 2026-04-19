from rest_framework import serializers
from .models import Invoice,InvoiceLine
from user.models import Client
from order_client.serializers import contractSerializerOne
from catalog.models import ProductType
class InvoiceLineFilterSerializer(serializers.ModelSerializer):
    product=serializers.CharField(source='product.name')
    class Meta:
        model=InvoiceLine
        fields='__all__'
class InvoiceFilterSerializerOne(serializers.ModelSerializer):
    invoice_InvoiceLine_items=InvoiceLineFilterSerializer(many=True)
    contract_type=serializers.CharField(source='contract.name',read_only=True)
    validated_by=serializers.SerializerMethodField()
    def get_validated_by(self,obj):
        return obj.validated_by.firstName if obj.validated_by else None
        
    class Meta:
        model=Invoice
        fields=['invoice_InvoiceLine_items','id','contract_type','type','states','date_de_facteration','validated_by','HT','TVA','TTC']


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


    
