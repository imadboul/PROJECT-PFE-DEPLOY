from django.shortcuts import render
from user.wraps import *
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import *
from .models import *
from django.utils import timezone
from user.views import notify_all_admin , notify_a_client

@api_view(['GET','POST'])
@jwt_must
def payments(request):
    client_id = request.user_id
    
    if request.method == 'GET':
    
        if request.role == 'client':
        
        
            payments = paymentcreateserializer(Payment.objects.filter(client_id = client_id), many = True)
        
            return Response ( { "payments" : payments.data}, status=status.HTTP_200_OK )
        else:
            payments = paymentcreateserializer(Payment.objects.all().order_by('-created_at'), many = True)
            return Response ( { "payments" : payments.data}, status=status.HTTP_200_OK )
            
    if request.method == 'POST':
        
        serializer = paymentcreateserializer(data = request.data)
        
        if serializer.is_valid():
            
            paymennt = serializer.save(client_id = client_id)
            
            notify_all_admin('validate payment', f' validate payment number {paymennt.id} done by {paymennt.client} ',f'http://localhost:5173/Payment/{paymennt.id}') # type: ignore
            
            return Response ( { "message" : 'request submitted wait for validation'}, status=status.HTTP_200_OK )
        else:
            return Response ( { "error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST )
        
@api_view(['GET'])
@jwt_must
def getbalance(request):
    
    if request.role == 'client':
        balcences = balanceserializer(Balance.objects.filter(client_id = request.user_id), many = True) # type: ignore
        
        return Response ( { "balances" : balcences.data}, status=status.HTTP_200_OK )
    else:
        balcences = balanceserializer(Balance.objects.all(), many = True )
        return Response ( { "balances" : balcences.data }, status=status.HTTP_200_OK )
    
@api_view(['GET'])
@jwt_must
def get_payment(request,id):
    try:
        payment = paymentreadserializer(Payment.objects.get(id = id))
        return Response ( { "payment" : payment.data }, status=status.HTTP_200_OK )
    except Payment.DoesNotExist:
        return Response ( { "error" : "does not exist"}, status=status.HTTP_400_BAD_REQUEST )
    
@api_view(['POST'])
@jwt_must
def validatePayment(request):
    serializer = paymentserializer(data = request.data)
    
    if serializer.is_valid():
        
        payment = Payment.objects.get(id = serializer.validated_data['id'] )  # type: ignore
        
        payment.state = serializer.validated_data['state'] # type: ignore
        payment.validated_by_id = request.user_id # type: ignore
        
        payment.save()
        
        notify_a_client(payment.client_id,'PAYMENT UPDATE', f'your payment number { payment.id } has beed {payment.state} by a super admin',f'http://localhost:5173/Payment/{payment.id}') # type: ignore
        
        if serializer.validated_data['state'] == 'validated': # type: ignore
            balance, create = Balance.objects.get_or_create(client = payment.client , productType = payment.productType)
            
            balance.amount += payment.amount # type: ignore
            balance.save()
            
        
        return Response ( { "message" : f"payment {payment.state}"}, status=status.HTTP_200_OK )
    else:
        return Response ( { "error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST )
    
def check_if_enough(amount, client_id, type_id):
    balance_qs = Balance.objects.filter(client_id=client_id, productType_id=type_id)

    if not balance_qs.exists():
        return {"success": False, "message": "No balance found"}

    balance = balance_qs.first()

    if amount > balance.amount: # type: ignore
        return {"success": False, "message": "Not enough balance"}
    balance.amount -= amount # type: ignore
    balance.save() # type: ignore

    return {"success": True, "message": "Balance is sufficient"}
        
    
    
    

    
    

        
        
        
        
                  
        
        
            
        
        
            
        
    
    