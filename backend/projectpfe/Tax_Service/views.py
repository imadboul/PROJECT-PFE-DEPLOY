from django.shortcuts import render
from rest_framework import generics
from .models import Tax,TaxProduct
from .serilazers import *
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from projectpfe.utils.response import *
from .filters import *
from django.utils.decorators import method_decorator
from user.wraps import *


@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['Admin', 'superAdmin']), name='dispatch')

class TaxSaveView(generics.CreateAPIView):
    
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    
    def create(self, request, *args, **kwargs):
        
        with transaction.atomic():
            serializer=self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
        return Response({'data':'Tax created successfully'},status=status.HTTP_201_CREATED)
    
    
        
@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['Admin', 'superAdmin']), name='dispatch')       

class TaxListView(generics.ListAPIView):
    
    def get(self, request, *args, **kwargs):
        
        search_type=kwargs['search_type'] 
        
        if search_type=='tax':
            
         queryset=Tax.objects.all()
         serializer_class=TaxFilterSerilazerOne
         filterset_class=FilterTax
         
        elif search_type=='tax_product':
            
         queryset=TaxProduct.objects.all()
         serializer_class=TaxProductFilterSerializer
         filterset_class=FilterTaxProduct
         
        queryset = filterset_class(request.GET, queryset=queryset).qs
        paginator = MyPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = serializer_class(page, many=True)
        response=paginated_response(paginator=paginator,serializer=serializer)
        
        return  success_response(data=response , message=" filter successfully ",status_code=200) 
        
        
        
        
        
        
    

    """ @transaction.atomic
    def perform_create(self, serializer):
        tax = serializer.save()
        tax_products_data = self.request.data.get('tax_taxProduct_items', [])
        for tax_product_data in tax_products_data:
            TaxProduct.objects.create(
                tax=tax,
                product=tax_product_data['product'],
                unit=tax_product_data['unit'],
                par_unit=tax_product_data['par_unit']
            )"""