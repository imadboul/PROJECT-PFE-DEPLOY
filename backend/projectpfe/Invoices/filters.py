import django_filters
from .models import Invoice , InvoiceLine

class InvoiceFilter(django_filters.FilterSet):
    client_id=django_filters.NumberFilter(field_name='contract__client__id',lookup_expr='iexact')
    contract_id=django_filters.NumberFilter(field_name='contract__id',lookup_expr='iexact')
    product_type_id=django_filters.NumberFilter(field_name='contract__product_type__id',lookup_expr='iexact')
    data_de_facteration_glt=django_filters.DateFilter(field_name='date_de_facteration',lookup_expr='date__gte')
    data_de_facteration_lte=django_filters.DateFilter(field_name='date_de_facteration',lookup_expr='date__lte')
    states=django_filters.CharFilter(field_name='states',lookup_expr='exact')
    type=django_filters.CharFilter(field_name='type',lookup_expr='exact')
    validate_by=django_filters.NumberFilter(field_name='validated_by__id',lookup_expr='exact')
    data_de_facteration=django_filters.DateFilter(field_name='date_de_facteration',lookup_expr='date')
    class Meta:
        model=Invoice 
        fields=['id']