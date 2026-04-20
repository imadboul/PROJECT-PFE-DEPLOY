from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from user.models import Client
from .models import Order,States,OrderProduct
from .serializers import *
from rest_framework import generics
from django.db import transaction
from .filters import *
from Tax_Service.taxCalcul import minus_balances
from rest_framework.exceptions import ValidationError
from user.wraps import *
from projectpfe.utils.response import success_response,paginated_response,MyPagination
from django.utils.decorators import method_decorator
from django.db import connection
from order_client.chackblc import total_price

@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['Admin', 'superAdmin']), name='dispatch')
class OrderCreateView(generics.CreateAPIView):
    
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def create(self,request,*args,**kwargs):
    
            serializer=self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            
            return success_response(data=None,message='Order created successfully',status_code=201)
            
       

@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['Admin', 'superAdmin']), name='dispatch')
class OrderValidateView(generics.UpdateAPIView):
    
    
    @transaction.atomic()
    def update(self, request, *args, **kwargs):
                 
         serializer=ValidateOrdersSerializer(data=request.data)
         serializer.is_valid(raise_exception=True)
         ids=serializer.validated_data['ids'] # type: ignore
         user=request.user_id           
          
         nbOrdes = Order.objects.select_for_update().filter(id__in=ids, states=States.LOADING).update(states=States.VALID,validated_by=user)  
         orders= Order.objects.select_for_update().filter(id__in=ids) 
          
         if nbOrdes:
            
            minus_balances(orders.prefetch_related(
             'order_orderProduct_items__product__product_taxProduct_items',
             'client__client_balances',
             'contract__product_type',
             'contract__contract_invoice_items__invoice_InvoiceLine_items'
             
            ).select_related('invoice').all())
            
            Orderclient.objects.filter( id__in=orders.values_list('client_order_id', flat=True).distinct() ).update(state=States.VALID)
            
            for order in orders.all():
                
                notify_a_client( order.client.id ,title=" validation ✅ : ",content=f" Mr. {order.client.firstName} {order.client.lastName} , Your order has been confirmed and an amount has been deducted from your account for the order corresponding to the following contract: {order.contract.product_type.name} ",link='')
            
         return success_response(data=nbOrdes,message='number Order validated successfully',status_code=200)
        
 
@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['Admin', 'superAdmin']), name='dispatch')  
class RectificativeOrderView(generics.CreateAPIView):
    
    queryset=Order.objects.all()
    serializer_class=RectificativeOrderSerializer
    @transaction.atomic()
    def create(self, request, *args, **kwargs):

            serializer=self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            return success_response(data=None,message='Order Rectificative successfully',status_code=201)




@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['Admin', 'superAdmin']), name='dispatch')
class OrderListView(generics.ListAPIView):
    
    
    serializer_class = OrderFilterSerializerThri
    filterset_class  = FilterOrder
    pagination_class = MyPagination

    def list(self, request, *args, **kwargs):
        user=request.user_id
        role=request.role
        
        if role=='superAdmin':
            self.queryset = Order.objects.select_related(  'contract__product_type','invoice').prefetch_related('order_orderProduct_items__product')
        elif role=='Admin':
            self.queryset = Order.objects.select_related(  'contract__product_type','invoice').prefetch_related('order_orderProduct_items__product').filter(client__manager=user)
        else:
            raise serializers.ValidationError("The is role not exist")
        
        response = super().list(request, *args, **kwargs)

        return success_response(  data=response.data,   message="filter successfully",  status_code=200 )
    
    
   
 
                  
       
 
         
@api_view(['POST'])     
def inValid(request):
    order = Orderclient.objects.get(id= 13)
    total = total_price(order.orderclient_Orderproductclient_items.all())
    print(total)
    check = check_if_enough(total,order.client_id,order.contract.product_type)
        
    
    return Response({'data':check})
            

    

    

    
   
    
    
    


















"""class OrderListView(generics.ListAPIView):
   
   def get(self,request,*args,**kwargs):
       
           order_type=str(kwargs['order_type'])
           
           if order_type=='a':
               
              queryset=OrderProduct.objects.select_related('order','product').all().distinct()
              serializer_class=OrderProductFilterSerializerOne
              filterset_class=FilterOrderProduct
                  
           elif order_type == 'b':
               
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
           elif order_type=='chargement':
               
               queryset=Order.objects.select_related('client','contract__product_type').prefetch_related('order_orderProduct_items__product').all().distinct()
               serializer_class=OrderFilterSerializerTri # serilazerone
               filterset_class=FilterOrder   
               
           elif order_type=='ch':
               
               queryset=Client.objects.prefetch_related('client_contracts__contract_order_items','client_contracts__product_type').all().distinct()
               serializer_class=ClientFilterSerializerOne
               filterset_class=FilterOrderAll
           
           queryset = filterset_class(request.GET, queryset=queryset).qs
           paginator = MyPagination()
           page = paginator.paginate_queryset(queryset, request)
           serializer = serializer_class(page, many=True)
           response=paginated_response(paginator=paginator,serializer=serializer)
           
           return  success_response(data=response , message="filter  successfully",status_code=201) """