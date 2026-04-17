from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from user.models import Client
from .models import Order,States,OrderProduct
from .serializers import *
from rest_framework import generics
from django.db import transaction
from .filters import *
from Tax_Service.taxCalcul import mains_balances
from rest_framework.exceptions import ValidationError
from user.wraps import *
from projectpfe.utils.response import success_response,paginated_response,MyPagination
from django.utils.decorators import method_decorator
from django.db import connection


#@method_decorator(jwt_must, name='dispatch')
class OrderCreateView(generics.CreateAPIView):
    
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    

        
    
    def create(self,request,*args,**kwargs):
    
            serializer=self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            
            return success_response(data=None,message='Order created successfully',status_code=201)
            
       

#@method_decorator(jwt_must, name='dispatch')
class OrderValidateView(generics.UpdateAPIView):
    
    def update(self, request, *args, **kwargs):
        
            with transaction.atomic():
                 
                 serializer=ValidateOrdersSerializer(data=request.data)
                 serializer.is_valid(raise_exception=True)
                 ids=serializer.validated_data['ids'] # type: ignore
                 #validated_by=request.user_id                 
                 nbOrdes=Order.objects.filter(id__in=ids, states=States.PENDING).update(states=States.VALID)                 
                 if nbOrdes!=0:
                    mains_balances(Order.objects.filter(id__in=ids).prefetch_related(
                       'order_orderProduct_items__product__product_taxProduct_items',
                     'client__client_balances',
                     'contract__product_type',
                     'contract__contract_invoice_items__invoice_InvoiceLine_items'
                     
                    ).select_related('invoice').all())
                    
                 
                 return success_response(data=nbOrdes,message='number Order validated successfully',status_code=200)
        
 
#@method_decorator(jwt_must, name='dispatch')   
class RectificativeOrderView(generics.CreateAPIView):
    
    queryset=Order.objects.all()
    serializer_class=RectificativeOrderSerializer
    def create(self, request, *args, **kwargs):

            serializer=self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            return success_response(data=None,message='Order Rectificative successfully',status_code=201)

#@method_decorator(jwt_must, name='dispatch')
class OrderListView(generics.ListAPIView):
   
   def get(self,request,*args,**kwargs):
       
           invoice_type=int(kwargs['invoice_type'])
           
           if invoice_type==1:
               
              queryset=OrderProduct.objects.select_related('order','product').all().distinct()
              serializer_class=OrderProductFilterSerializerOne
              filterset_class=FilterOrderProduct
                  
           elif invoice_type == 2:
               
                     filtered = FilterOrder(   request.GET, queryset=Order.objects.select_related('client', 'contract__product_type')).qs                 
                     seen = set()
                     result = []
                 
                     for order in filtered:
                         key = (order.client.id, order.contract.id)
                 
                         if key not in seen:
                             seen.add(key)
                             result.append(order)
         
                     paginator = MyPagination()
                     page = paginator.paginate_queryset(result, request)
                     serializer =OrderFilterSerializerTow(page, many=True)
                     response=paginated_response(paginator=paginator,serializer=serializer)
                     
                     return success_response(data=response , message="filter successfully",status_code=201)  
           elif invoice_type==3:
               
               queryset=Order.objects.select_related('client','contract__product_type').prefetch_related('order_orderProduct_items__product').all().distinct()
               serializer_class=OrderFilterSerializerOne
               filterset_class=FilterOrder   
               
           elif invoice_type==4:
               
               queryset=Client.objects.prefetch_related('client_contracts__contract_order_items','client_contracts__product_type').all().distinct()
               serializer_class=ClientFilterSerializerOne
               filterset_class=FilterOrderAll
           
           queryset = filterset_class(request.GET, queryset=queryset).qs
           paginator = MyPagination()
           page = paginator.paginate_queryset(queryset, request)
           serializer = serializer_class(page, many=True)
           response=paginated_response(paginator=paginator,serializer=serializer)
           
           return  success_response(data=response , message="filter  successfully",status_code=201) 
       
 
         
@api_view(['PUT'])     
def inValid(request):
    order=Order.objects.prefetch_related(
                     'order_orderProduct_items__product__product_taxProduct_items',
                     'client__client_balances',
                     'contract__product_type',
                     'contract__contract_invoice_items__invoice_InvoiceLine_items'
                     
                    ).select_related('invoice').all()
    
    mains_balances(order)   
    return Response({'data':'bouklia'})
            

    

    

    
   
    
    
    
