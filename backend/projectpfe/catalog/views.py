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
from projectpfe.utils.response import *







@api_view(['POST', 'GET', 'PUT', 'DELETE'])
@jwt_must
def producttype(request):
    
    if request.method == 'POST':
        serializer = producttypecreateserializer(data=request.data)

        if serializer.is_valid():
            type = serializer.save()

            return success_response(
                message=f"type created successfully! ({type.id})", # type: ignore
                status_code=status.HTTP_201_CREATED
            )

        return error_response(
            message="Validation failed",
            errors=serializer.errors
        )

    if request.method == 'GET':
        product_type_id = request.GET.get('product_type')
        types = producttypeserializer(ProductType.objects.all(), many=True)

        return success_response(
            data={"types": types.data},
            message="Types retrieved successfully",
            status_code=status.HTTP_200_OK
        )

    if request.method == 'PUT':
        producttype_id = request.data.get('id')

        try:
            type = ProductType.objects.get(id=producttype_id)

        except ProductType.DoesNotExist:
            return error_response(
                message="Type does not exist"
            )

        update_serializer = producttypecreateserializer(
            type,
            data=request.data,
            partial=True
        )

        if update_serializer.is_valid():
            update_serializer.save()

            return success_response(
                data=update_serializer.data,
                message="Success: changes applied",
                status_code=status.HTTP_200_OK
            )

        return error_response(
            message="Update failed",
            errors=update_serializer.errors
        )

    if request.method == 'DELETE':
        producttype_id = request.data.get('id')

        try:
            type = ProductType.objects.get(id=producttype_id)

        except ProductType.DoesNotExist:
            return error_response(
                message="Type does not exist"
            )

        type.delete()

        return success_response(
            message="Successfully deleted",
            status_code=status.HTTP_200_OK
        )
                
                

@api_view(['POST', 'GET', 'PUT', 'DELETE'])
@jwt_must
def product(request):
    
    if request.method == 'POST':
        serializer = productcreateserializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return success_response(
                message="Product created successfully",
                status_code=status.HTTP_201_CREATED
            )

        return error_response(
            message="Validation failed",
            errors=serializer.errors
        )

    if request.method == 'GET':
        product_type_id = request.data.get('product_type')
        
        if product_type_id:
            products = productserializer(Product.objects.filter(active=True , product_type_id = product_type_id),many=True)
        
        else:
            products = productserializer(Product.objects.filter(active=True),many=True)
            


        return success_response(
            data={"products": products.data},
            message="Products retrieved successfully",
            status_code=status.HTTP_200_OK
        )

    if request.method == 'PUT':
        product_id = request.data.get('id')

        try:
            product = Product.objects.get(id=product_id)

        except Product.DoesNotExist:
            return error_response(
                message="Product does not exist"
            )

        update_serializer = productcreateserializer(
            product,
            data=request.data,
            partial=True
        )

        if update_serializer.is_valid():
            update_serializer.save()

            return success_response(
                data=update_serializer.data,
                message="Success: changes applied",
                status_code=status.HTTP_200_OK
            )

        return error_response(
            message="Update failed",
            errors=update_serializer.errors
        )

    if request.method == 'DELETE':
        product_id = request.data.get('id')

        try:
            product = Product.objects.get(id=product_id)

        except Product.DoesNotExist:
            return error_response(
                message="Product does not exist"
            )

        product.delete()

        return success_response(
            message="Successfully deleted",
            status_code=status.HTTP_200_OK
        )
                
                
                
            
        
        
        
        
    
    

@api_view(['POST', 'GET'])
@jwt_must
def contract(request):
    
    if request.method == 'POST':
        serializer = contractcreateserializer(data=request.data)

        client_id = request.user_id

        if serializer.is_valid():
            contract = serializer.save(client_id=client_id)

            notify_all_superadmin(
                'validate contract',
                f'contract number ({contract.id})', # type: ignore
                f'http://localhost:5173/Contracts/{contract.id}' # type: ignore
            )

            return success_response(
                data=contractserializer(contract).data,
                message="Done, wait for validation",
                status_code=status.HTTP_201_CREATED
            )

        return error_response(
            message="Validation failed",
            errors=serializer.errors
        )

    if request.method == 'GET':
        client_id = request.user_id
        role = request.role

        if role == 'client':
            contracts = contractreadserializer(
                Contract.objects.filter(client_id=client_id),
                many=True
            )

        else:
            contracts = contractreadserializer(
                Contract.objects.all(),
                many=True
            )

        return success_response(
            data={"contracts": contracts.data},
            message="Contracts retrieved successfully",
            status_code=status.HTTP_200_OK
        )
    
    
@api_view(['POST'])
@jwt_must
def validatecontract(request):
    try:
        serializer = contractserializer(data=request.data)

        if serializer.is_valid():

            contract = Contract.objects.get(
                id=serializer.validated_data['id'] # type: ignore
            )

            contract.state = serializer.validated_data['state'] # type: ignore
            contract.validated_at = timezone.now()
            contract.validated_by_id = request.user_id # type: ignore

            contract.save()

            notify_a_client(
                contract.client_id, # type: ignore
                'CONTRACT UPDATE',
                f'your contract number {contract.id} has been {contract.state} by a super admin',
                f'http://localhost:5173/Contracts/{contract.id}'
            )

            return success_response(
                message=f"contract {contract.state}",
                status_code=status.HTTP_200_OK
            )

        return error_response(
            message="Validation failed",
            errors=serializer.errors
        )

    except Exception as e:
        return error_response(
            message="Unexpected error",
            errors=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@jwt_must
def get_contract(request, id):
    try:

        if request.role == 'client':
            contract_obj = Contract.objects.get(
                id=id,
                client_id=request.user_id
            )
        else:
            contract_obj = Contract.objects.get(id=id)

        contract = contractreadserializer(contract_obj)

        return success_response(
            data=contract.data,
            message="Contract retrieved successfully",
            status_code=status.HTTP_200_OK
        )

    except Contract.DoesNotExist:
        return error_response(
            message="Contract does not exist or you do not have permission"
        )
        
        
        
        
    
@api_view(['GET'])
@jwt_must
def contractpdf(request, id):

    try:
        if request.role in ['admin', 'superAdmin']:
            contract = Contract.objects.get(id=id)
        else:
            contract = Contract.objects.get(id=id, client_id=request.user_id)

        return generate_pdf(contract.id)

    except Contract.DoesNotExist:
        return error_response(
            message="Contract does not exist or you do not have permission"
        )
        


        
         
        
        
    









    
    

        






