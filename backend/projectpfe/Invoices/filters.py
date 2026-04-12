import django_filters
from .models import Invoice , InvoiceLine

class InvoiceFilter(django_filters.FilterSet):
    client_id=django_filters.NumberFilter(field_name='contract__client__id',lookup_expr='iexact')
    class Meta:
        model=Invoice 
        fields=['id','date_de_facteration','states','type','validated_by','contract']