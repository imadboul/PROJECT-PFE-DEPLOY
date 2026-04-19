from django.db import transaction
from rest_framework import serializers
from .models import Tax,TaxProduct
from django.utils import timezone

def get_now():
    return timezone.now().isoformat().replace('+00:00', 'Z')

class TaxProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = TaxProduct
        fields = ['product','unit','par_unit']


class TaxSerializer(serializers.ModelSerializer):
    tax_taxProduct_items = TaxProductSerializer(many=True)
    class Meta:
        model = Tax
        fields = ['name','description','tax_taxProduct_items']
        
        
    @transaction.atomic
    def create(self, validated_data):
        
        tax_product_data=validated_data.pop('tax_taxProduct_items')
        tax=Tax.objects.filter(name=validated_data['name']).first()
        
        
        if not tax:
            tax=Tax.objects.create(**validated_data)
           
        else:
            products_tax=TaxProduct.objects.filter(tax=tax,product__in=[data['product'] for data in tax_product_data])
            products_tax.update(end_date=get_now(),is_active=False)
            
            
        for data in tax_product_data:
                TaxProduct.objects.create(
                    tax=tax,
                    product=data['product'],
                    unit=data['unit'],
                    par_unit=data['par_unit']
                )
                
        return tax        
                
class TaxFilterSerilazerOne(serializers.ModelSerializer):
    class Meta:
        model=Tax
        fields='__all__'

class TaxProductFilterSerializer(serializers.ModelSerializer):
    tax_name = serializers.CharField(source='tax.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    class Meta:
        model=TaxProduct
        fields=['id','tax_name','product_name','start_date','end_date','unit','par_unit','is_active']



