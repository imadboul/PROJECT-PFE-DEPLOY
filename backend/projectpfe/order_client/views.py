
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import *
from .serializers import *
from rest_framework import generics
from django.db import transaction
from rest_framework.decorators import api_view
from catalog.models import Contract,Client
from django.utils.decorators import method_decorator
from user.wraps import *
from user.views import notify_all_admin , notify_a_client
from .orderclientpdf import generate_pdf




@api_view(['POST','GET'])
@jwt_must
def order(request):
    if request.method == 'POST':
        try:
            serializer = OrderSerializer(data=request.data, context = {'user_id': request.user_id})
            print('imad')
            if serializer.is_valid():
                order = serializer.save(client_id=request.user_id)  # type: ignore
                print('imadsss')
                notify_all_admin('VALIDATE AN ORDER',f'validate order {order.id}','') # type: ignore
                return Response({'data': 'Order created successfully wait for validation'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'errorssss': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    
    if request.method == 'GET':
        if request.role == 'client':
            orders = OrderreadSerializer(Orderclient.objects.filter(client_id = request.user_id), many= True)
            return Response({"orders": orders.data}, status=status.HTTP_200_OK)
        else:
            orders = OrderreadSerializer(Orderclient.objects.all(), many= True)
            return Response({"orders": orders.data}, status=status.HTTP_200_OK)
    
    

        

        
        
        
@api_view(['POST'])     
@jwt_must
def validateorder(request):
    try:
        with transaction.atomic():
            serializer=ValidateOrdersSerializer(data=request.data)
            
            if serializer.is_valid():
                
                order = Orderclient.objects.get(id= serializer.validated_data['id'] ) # type: ignore
                
                
                order.state = serializer.validated_data['state'] # type: ignore
                order.validated_by_id = request.user_id # type: ignore
                order.save()
                return Response({"message": "Order validated successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e :
        return  Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST) # type: ignore
 
   
@api_view(['GET'])
@jwt_must
def get_order(request,id):
    try:
        if request.role == 'client':
            order = OrderreadSerializer(Orderclient.objects.get(id=id,client_id= request.user_id))
            return Response({"orders": order.data}, status=status.HTTP_200_OK)
        else:
            order = OrderreadSerializer(Orderclient.objects.get(id=id))
            return Response({"orders": order.data}, status=status.HTTP_200_OK)
            
    except Orderclient.DoesNotExist:
        return Response({'error': 'does not exist or you do not have permission' }, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@jwt_must
def orderclientpdf(request,id):
    
    try:
        order = Orderclient.objects.get(id = id)
        
        if request.role == 'client':
            if order.client_id != request.user_id: # type: ignore
                return Response ( { "error" : "does not exist  or you do not have permission"}, status=status.HTTP_400_BAD_REQUEST )
            else:
                return generate_pdf(id)
    
        return generate_pdf(id)
            
    except Contract.DoesNotExist:
        return Response ( { "error" : "does not exist  or you do not have permission"}, status=status.HTTP_400_BAD_REQUEST )
        
        
        
        
        
    
    

    

    
   
    
    
    
