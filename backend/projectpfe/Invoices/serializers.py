from rest_framework import serializers
from .models import Invoice,InvoiceLine
class InvoiceLineFilterSerializer(serializers.ModelSerializer):
    class Meta:
        model=InvoiceLine
        fields='__all__'
class InvoiceFilterSerializerTow(serializers.ModelSerializer):
    invoice_InvoiceLine_items=InvoiceLineFilterSerializer(many=True)
    class Meta:
        model=Invoice
        fields=['id','contract','type','states','date_de_facteration','validated_by','HT','TVA','TTC']

class InvoiceFilterSerializerOne(serializers.ModelSerializer):
    class Meta:
        model=Invoice
        fields='__all__'


class vlaidatedInvoiceSerializer(serializers.Serializer):
    ids=serializers.ListField(child=serializers.IntegerField(),allow_empty=False) 
    