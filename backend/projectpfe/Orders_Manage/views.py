
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from .models import Order,States,OrderProduct
from .serializers import OrderSerializer,ValidateOrdersSerializer,RectificativeOrderSerializer,OrderProductFilterSerializerOne,OrderFilterSerializerTow,ClientFilterSerializerOne,OrderFilterSerializerOne
from rest_framework import generics
from django.db import transaction
from rest_framework.decorators import api_view
from catalog.models import Contract,Client
from .filters import FilterOrderProduct,FilterOrder,FilterOrderAll



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
                 serializer=ValidateOrdersSerializer(data=request.data)
                 serializer.is_valid(raise_exception=True)
                 ids=serializer.validated_data['ids']
                 orders=Order.objects.filter(id__in=ids)
                 nbOrdes=orders.update(states=States.VALID)
                 nbLine=OrderProduct.objects.filter(order__in=orders).update(states=States.VALID)
                 return Response({"message": "Orders validated successfully" , "Number of Orders valid":nbOrdes,"Number Of OrderProduct valid":nbLine }, status=status.HTTP_200_OK)
        except Exception as e :
            return  Response({"message": "Failed to validate orders","error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
 
    
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
              
           elif type==2:
               self.queryset=Order.objects.select_related('client','contract__product_type').prefetch_related('order_orderProduct_items__product').all().distinct()
               self.serializer_class=OrderFilterSerializerOne
               self.filterset_class=FilterOrder    

           return self.list(request,*args,**kwargs)  
       except Exception as e:
             return Response({'error':str(e)},status=status.HTTP_400_BAD_REQUEST) 
    
    
""" elif type == 2:
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
                 
                     serializer = OrderFilterSerializer1(result, many=True)
                     return Response(serializer.data)"""
    
   
    
    
    
