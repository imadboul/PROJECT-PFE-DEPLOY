import django_filters
from .models import *

class FilterTax(django_filters.FilterSet):
    name=django_filters.CharFilter(field_name='name' , lookup_expr="icontains")
    class Meta:
        model=Tax
        fields=[]
        
        
class FilterTaxProduct(django_filters.FilterSet):
    name=django_filters.CharFilter(field_name='tax__name' , lookup_expr="icontains")
    start_date_gte=django_filters.DateFilter(field_name='start_date',lookup_expr='date__gte')
    end_date_lte=django_filters.DateFilter(field_name='end_date',lookup_expr='date__lte')
    product_id=django_filters.NumberFilter(field_name='product__id',lookup_expr='iexact')
    
    class Meta:
        model=TaxProduct
        fields=[]