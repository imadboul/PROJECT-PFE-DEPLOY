from django.shortcuts import render
from user.wraps import *
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import *
from .models import *
from django.utils import timezone
from user.views import notify_all_superadmin , notify_a_client
from .contractpdf import generate_pdf







@api_view(['POST', 'GET'])
@jwt_must
def producttype(request):
    if request.method == 'POST':
        
    
        serializer = producttypecreateserializer(data = request.data)
    
        if serializer.is_valid():
            type = serializer.save()
            return Response({
            "message": f"type created successfully! ({type.id})", # type: ignore
               }, status=status.HTTP_201_CREATED)
        
        else:
            return Response ( { "error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST )
    
    if request.method == 'GET':
    
        types =  producttypeserializer(ProductType.objects.all() , many = True)
         
        return Response ( { "types" : types.data}, status=status.HTTP_200_OK )


@api_view(['POST','GET'])
@jwt_must
def product(request):
    if request.method == 'POST':
        serializer = productcreateserializer(data = request.data)
    
        if serializer.is_valid():
            serializer.save()
            return Response({
               "message": "product created successfully!",
                }, status=status.HTTP_201_CREATED)
        
        else:
            return Response ( { "error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST )
    
    if request.method == 'GET':
    
        products =  productserializer(Product.objects.filter(active=True),many=True)
         
        return Response ( { "products" : products.data}, status=status.HTTP_200_OK )



@api_view(['POST','GET'])
@jwt_must
def contract(request):
    if request.method == 'POST':
        
    
        serializer = contractcreateserializer(data = request.data)
    
        client_id = request.user_id
    
        if serializer.is_valid():
        
            contract = serializer.save(client_id= client_id)
            notify_all_superadmin('validate contract',f'contract number ({contract.id})','') # type: ignore
            return Response({
                "message": " done wait for validation",
                "contract": contractserializer(contract).data
                   }, status=status.HTTP_201_CREATED)
        
        
        
        else:
            return Response ( { "error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST )
    
    if request.method == 'GET':
        client_id = request.user_id
        role = request.role
    
        if(role == 'client'):
        
            contracts = contractreadserializer(Contract.objects.filter(client_id = client_id), many= True)
            return Response ( { "contracts" : contracts.data }, status=status.HTTP_200_OK )
    
        else:
            contracts = contractreadserializer(Contract.objects.all(), many= True)
            return Response ( { "contracts" : contracts.data }, status=status.HTTP_200_OK )
    
    
    
@api_view(['POST'])
@jwt_must
def validatecontract(request):
    
    serializer = contractserializer(data = request.data)
    
    if serializer.is_valid():
        
        contract = Contract.objects.get(id = serializer.validated_data['id'] )  # type: ignore
        
        contract.state = serializer.validated_data['state'] # type: ignore
        contract.validated_at = timezone.now()
        contract.validated_by_id = request.user_id # type: ignore
        
        contract.save()
        
        notify_a_client(contract.client_id,'CONTRACT UPDATE', f'your contract number{ contract.id } has beed {contract.state} by a super admin','') # type: ignore
        
        return Response ( { "message" : f"contract {contract.state} "}, status=status.HTTP_200_OK )
    else:
        return Response ( { "error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST )
    
@api_view(['GET'])
@jwt_must
def contractpdf(request,id):
    
    try:
        if request.role in ['admin','superAdmin']:
            contract = Contract.objects.get(id = id)
            return generate_pdf(contract.id)
        else:
            contract = Contract.objects.get(id = id, client_id = request.user_id)
            return generate_pdf(contract.id)
            
    except Contract.DoesNotExist:
        return Response ( { "error" : "does not exist  or you do not have permission"}, status=status.HTTP_400_BAD_REQUEST )
        


        
         
        
        
    









    
    

        






