from rest_framework import serializers
from .models import Invoice,InvoiceLine
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




class vlaidatedInvoiceSerializerOne(serializers.Serializer):
    ids=serializers.ListField(child=serializers.IntegerField(),allow_empty=False) 


    
