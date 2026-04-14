from django.shortcuts import render
from user.wraps import *
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view 
from .serializers import *
from .models import *
from django.utils import timezone
from user.views import notify_all_admin , notify_a_client
from projectpfe.utils.response import *


@api_view(['GET','POST'])
@jwt_must
def payments(request):
    client_id = request.user_id
    
    if request.method == 'GET':
    
        paginator = MyPagination()

        if request.role == 'client':
            queryset = Payment.objects.filter(client_id=client_id)
        else:
            queryset = Payment.objects.all().order_by('-created_at')

        result_page = paginator.paginate_queryset(queryset, request)
        serializer = paymentreadserializer(result_page, many=True)

        return success_response(data=paginated_response(paginator, serializer),message="Payments retrieved successfully",status_code=200)
            
    if request.method == 'POST':
        
        serializer = paymentcreateserializer(data = request.data)
        
        if serializer.is_valid():
            
            paymennt = serializer.save(client_id = client_id)
            
            notify_all_admin('validate payment', f' validate payment number {paymennt.id} done by {paymennt.client} ',f'http://localhost:5173/Payment/{paymennt.id}') # type: ignore
            
            return success_response(message="Request submitted, waiting for validation",status_code=201)
        else:
            return error_response(message="Validation failed",errors=serializer.errors)
@api_view(['GET'])
@jwt_must
def getbalance(request):
        paginator = MyPagination()
        print(request.role) 
        if request.role == 'client':
            queryset = Balance.objects.filter(client_id=request.user_id)
        else:
            queryset = Balance.objects.all()

        result_page = paginator.paginate_queryset(queryset, request)
        serializer = balanceserializer(result_page, many=True)
        return success_response(data=paginated_response(paginator, serializer),message="balnces retrieved successfully",status_code=200)
    
@api_view(['GET'])
@jwt_must
def get_payment(request,id):
    try:
        if request.role == 'client':
            payment = paymentreadserializer(Payment.objects.get(id = id, client_id = request.user_id))
            return success_response(data=payment.data,message="payment retrieved successfully",status_code=200)
        else:
            payment = paymentreadserializer(Payment.objects.get(id = id))
            return success_response(data=payment.data,message="payment retrieved successfully",status_code=200)
    except Payment.DoesNotExist:
        return error_response(message="failed",errors="payment does not exist or you do not have permission")
    
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
            
        
        return success_response(message=f"payment {payment.state}",status_code=200) 
    else:
        return error_response(message="failed",errors=serializer.errors)
    
    
    
    
def check_if_enough(amount, client_id, type_id):
    
    print('ddddddddddddddd')
    balance_qs = Balance.objects.filter(client_id=client_id, productType_id=type_id)

    if not balance_qs.exists():
        return {"success": False, "message": "No balance found"}

    balance = balance_qs.first()
    print(balance)
    if amount > balance.amount: # type: ignore
        return {"success": False, "message": "Not enough balance"}
    balance.amount -= amount # type: ignore
    balance.save() # type: ignore

    return {"success": True, "message": "Balance is sufficient"}
        
    
    
    

    
    

        
        
        
        
                  
        
        
            
        
        
            
        
    
    