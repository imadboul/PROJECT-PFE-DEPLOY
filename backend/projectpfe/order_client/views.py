
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import *
from .serializers import *
from rest_framework import generics
from django.db import transaction

from catalog.models import Contract,Client
from django.utils.decorators import method_decorator
from user.wraps import *
from user.views import notify_all_admin , notify_a_client
from .orderclientpdf import generate_pdf
from projectpfe.utils.response import *
from datetime import date
from django.utils.dateparse import parse_date




@api_view(['POST', 'GET'])
@jwt_must
def order(request):

    if request.method == 'POST':
        try:
            serializer = OrderSerializer(
                data=request.data,
                context={'user_id': request.user_id}
            )

            print('imad')

            if serializer.is_valid():
                order = serializer.save(client_id=request.user_id)  # type: ignore

                print('imadsss')

                notify_all_admin(
                    'VALIDATE AN ORDER',
                    f'validate order {order.id}', # type: ignore
                    f'http://localhost:5173/order/{order.id}' # type: ignore
                )

                return success_response(
                    message="Order created successfully, wait for validation",
                    status_code=status.HTTP_201_CREATED
                )

            return error_response(
                message="Validation failed",
                errors=serializer.errors
            )

        except Exception as e:
            return error_response(
                message="Unexpected error",
                errors=str(e)
            )

    if request.method == 'GET':
        

        paginator = MyPagination()

        if request.role == 'client':
            queryset = Orderclient.objects.filter(client_id=request.user_id)
        else:
            client_id = request.data.get('client_id')
            if client_id:
                queryset = Orderclient.objects.filter(client_id = client_id)
            else:
                queryset = Orderclient.objects.all()

        result_page = paginator.paginate_queryset(queryset, request)
        orders = OrderreadSerializer(result_page, many=True)

        return success_response(
            data=paginated_response(paginator, orders),
            message="Orders retrieved successfully",
            status_code=status.HTTP_200_OK
        )
    

        
@api_view(['GET'])
@jwt_must
@role_required(['Admin', 'superAdmin'])
def getclients(request):

    paginator = MyPagination()
    date = request.data.get('date')
    
    if date:
        valid_date = parse_date(date)

        if valid_date is None:
            return error_response( message="wrong date",errors="Invalid date format. Use YYYY-MM-DD" )
        queryset = Client.objects.filter(client_Ordersclient_items__pickup_date__lte = date,client_Ordersclient_items__isnull=False).distinct()

    else:
        queryset = Client.objects.filter(client_Ordersclient_items__isnull=False).distinct()

    result_page = paginator.paginate_queryset(queryset, request)

    clients = ClientreadSerializer(result_page, many=True)

    return success_response(
        data=paginated_response(paginator, clients),
        message="Clients retrieved successfully",
        status_code=status.HTTP_200_OK
    )
    
@api_view(['GET'])
@jwt_must
@role_required(['Admin', 'superAdmin'])
def gettodaysorders(request):
       
    paginator = MyPagination()
    date = request.data.get('date')
    
    if not date:
        date = date.today()

    
    queryset = Client.objects.filter(client_Ordersclient_items__pickup_date__lte = date).distinct()
    result_page = paginator.paginate_queryset(queryset, request)

    clients = OrderreadSerializer(result_page, many=True)

    return success_response(
        data=paginated_response(paginator, clients),
        message="Clients retrieved successfully",
        status_code=status.HTTP_200_OK
    )
    
    

        
    
        
@api_view(['POST'])
@jwt_must
def validateorder(request):
    try:

        with transaction.atomic():
            serializer = ValidateOrdersSerializer(data=request.data)

            if not serializer.is_valid():
                return error_response(
                    message="Validation failed",
                    errors=serializer.errors
                )

            try:
                order = Orderclient.objects.get(
                    id=serializer.validated_data['id']  # type: ignore
                )
            except Orderclient.DoesNotExist:
                return error_response(
                    message="Order does not exist" , status_code=400
                )

            order.state = serializer.validated_data['state']  # type: ignore
            order.pickup_date = serializer.validated_data['pickup_date'] # type: ignore
            order.validated_by_id = request.user_id  # type: ignore
            order.save()
            notify_a_client(order.client_id,'ORDER UPDATE',f'your order {order.id} has been validated by an admin do not forget the order notice pick up is on {order.pickup_date}',f'http://localhost:5173/order/{order.id}') # type: ignore

            return success_response(
                message="Order validated successfully",
                status_code=status.HTTP_200_OK
            )

    except Exception as e:
        return error_response(
            message="Unexpected error",
            errors=str(e)
        )
 
   
@api_view(['GET'])
@jwt_must
def get_order(request, id):
    try:
        
        if request.role == 'client':
            order = Orderclient.objects.get(
                id=id,
                client_id=request.user_id
            )
        else:
            order = Orderclient.objects.get(id=id)

        serializer = OrderreadSerializer(order)

        return success_response(
            data={"order": serializer.data},
            message="Order retrieved successfully",
            status_code=status.HTTP_200_OK
        )

    except Orderclient.DoesNotExist:
        return error_response(
            message="Order does not exist or you do not have permission"
        )

    except Exception as e:
        return error_response(
            message="Unexpected error",
            errors=str(e)
        )
        
@api_view(['GET'])
@jwt_must
def orderclientpdf(request, id):

    try:
        order = Orderclient.objects.get(id=id)

        if request.role == 'client' and order.client_id != request.user_id: # type: ignore
            return error_response(
                message="Order does not exist or you do not have permission", status_code=400
            )

        return generate_pdf(id)

    except Orderclient.DoesNotExist:
        return error_response(
            message="Order does not exist or you do not have permission" ,status_code=400
        )
        
        
        
        
        
    
    

    

    
   
    
    
    
