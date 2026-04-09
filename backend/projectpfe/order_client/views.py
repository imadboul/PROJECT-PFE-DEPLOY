from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from user.models import Client
from .models import Order,States,OrderProduct
from .serializers import OrderSerializer,ValidateOrdersSerializer,RectificativeOrderSerializer,OrderProductFilterSerializerOne,OrderFilterSerializerOne,OrderFilterSerializerTow,ClientFilterSerializerOne
from rest_framework import generics
from django.db import transaction
from .filters import FilterOrderProduct,FilterOrder,FilterOrderAll
from Tax_Service.taxCalcul import mains_balances
import logging

logging=logging.getLogger(__name__)


class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    def create(self,request,*args,**kwargs):
        try:
            serializer=self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({'data':'Order created successfully'},status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({  "message": "Failed to create order", "error": str(e)},status.HTTP_400_BAD_REQUEST)

class OrderValidateView(generics.UpdateAPIView):
    
    def update(self, request, *args, **kwargs):
        
        try:
            with transaction.atomic():
                 logging.info("Starting order validation process")
                 serializer=ValidateOrdersSerializer(data=request.data)
                 serializer.is_valid(raise_exception=True)
                 ids=serializer.validated_data['ids']
                 
                 nbOrdes=Order.objects.filter(id__in=ids, states=States.PENDING).update(states=States.VALID)
                 
                 
                 if nbOrdes!=0:
                    mains_balances(Order.objects.filter(id__in=ids) )
                    logging.info("Updated client balances for validated orders ended successfully") 
                 
                 return Response({"message": "Orders validated successfully" , "Number of Orders valid":nbOrdes}, status=status.HTTP_200_OK)
        except Exception as e :
            return  Response({"message": "Failed to validate orders","error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
 
    
class RectificativeOrderView(generics.CreateAPIView):
    queryset=Order.objects.all()
    serializer_class=RectificativeOrderSerializer
    def create(self, request, *args, **kwargs):
        try:
            serializer=self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({'data':'Rectificative Order Successfully'},status=status.HTTP_201_CREATED)
        except Exception as e:    
            return Response({'error':str(e)},status=status.HTTP_400_BAD_REQUEST)

class OrderListView(generics.ListAPIView):
   
   def get(self,request,*args,**kwargs):
       try:
           type=kwargs['type']
           if type==1:
              self.queryset=OrderProduct.objects.select_related('order','product').all().distinct()
              self.serializer_class=OrderProductFilterSerializerOne
              self.filterset_class=FilterOrderProduct
           elif type == 2:
                     filtered = FilterOrder(
                         request.GET,
                         queryset=Order.objects.select_related('client', 'contract__product_type')
                     ).qs
                 
                     seen = set()
                     result = []
                 
                     for order in filtered:
                         key = (order.client.id, order.contract.id)
                 
                         if key not in seen:
                             seen.add(key)
                             result.append(order)
                 
                     serializer = OrderFilterSerializerTow(result, many=True)
                     return Response(serializer.data)
              
           elif type==3:
               self.queryset=Order.objects.select_related('client','contract__product_type').prefetch_related('order_orderProduct_items__product').all().distinct()
               self.serializer_class=OrderFilterSerializerOne
               self.filterset_class=FilterOrder   
           elif type==4:
               self.queryset=Client.objects.prefetch_related('client_contracts__contract_order_items','client_contracts__product_type').all().distinct()
               self.serializer_class=ClientFilterSerializerOne
               self.filterset_class=FilterOrderAll

           return self.list(request,*args,**kwargs)  
       except Exception as e:
             return Response({'error':str(e)},status=status.HTTP_400_BAD_REQUEST) 
         
@api_view(['PUT'])     
def inValid(request):
    Order.objects.update(states=States.PENDING)
    return Response({'data':'bien'})
            
