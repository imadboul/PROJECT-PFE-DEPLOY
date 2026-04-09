import django_filters
from .models import Order,OrderProduct,Types,States
from user.models import Client




class FilterOrderAll(django_filters.FilterSet):
    type= django_filters.CharFilter(field_name='type',lookup_expr='iexact')
    states=django_filters.CharFilter(field_name='client_contracts__contract_order_items__states',lookup_expr='iexact') 
    date_created=django_filters.DateFilter(field_name='client_contracts__contract_order_items__date_created',lookup_expr='date')
    date_created__gte=django_filters.DateFilter(field_name='client_contracts__contract_order_items__date_created',lookup_expr='date__gte')
    date_created__lte=django_filters.DateFilter(field_name='client_contracts__contract_order_items__date_created',lookup_expr='date__lte')
    client_id=django_filters.NumberFilter(field_name='id',lookup_expr='exact')
    contract_id=django_filters.NumberFilter(field_name='client_contracts__id',lookup_expr='exact')
    name_type=django_filters.CharFilter(field_name='client_contracts__product_type__name',lookup_expr='iexact')
    class Meta:
        model=Client
        fields=['id']    


class FilterOrderProduct(django_filters.FilterSet):
    type= django_filters.CharFilter(field_name='order__type',lookup_expr='iexact')
    states=django_filters.CharFilter(field_name='order__states',lookup_expr='iexact') 
    date_created=django_filters.DateFilter(field_name='order__date_created',lookup_expr='date')
    date_created__gte=django_filters.DateFilter(field_name='order__date_created',lookup_expr='date__gte')
    date_created__lte=django_filters.DateFilter(field_name='order__date_created',lookup_expr='date__lte')
    id=django_filters.NumberFilter(field_name='id',lookup_expr='exact')
    contract_id=django_filters.NumberFilter(field_name='order__contract',lookup_expr='exact')
    product_name_type=django_filters.CharFilter(field_name='product__product_type__name',lookup_expr='iexact')
    client_id=django_filters.NumberFilter(field_name='order__client',lookup_expr='exact')
    order_id=django_filters.NumberFilter(field_name='order')
    class Meta:
        model=OrderProduct
        fields=['id']   
        
        
class FilterOrder(django_filters.FilterSet):
    type= django_filters.CharFilter(field_name='type',lookup_expr='iexact')
    states=django_filters.CharFilter(field_name='states',lookup_expr='iexact') 
    date_created=django_filters.DateFilter(field_name='date_created',lookup_expr='date')
    date_created__gte=django_filters.DateFilter(field_name='date_created',lookup_expr='date__gte')
    date_created__lte=django_filters.DateFilter(field_name='date_created',lookup_expr='date__lte')
    id=django_filters.NumberFilter(field_name='id',lookup_expr='exact')
    contract_id=django_filters.NumberFilter(field_name='contract',lookup_expr='exact')
    product_name_type=django_filters.CharFilter(field_name='contract__product_type__name',lookup_expr='iexact')
    client_id=django_filters.NumberFilter(field_name='client',lookup_expr='exact')
    product_name=django_filters.CharFilter(field_name='order_orderProduct_items__product__name',lookup_expr='iexact')
    
    class Meta:
        model=Order
        fields=['id']  