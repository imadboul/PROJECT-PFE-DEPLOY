from django.shortcuts import render
from rest_framework import generics
from .models import Invoice,StatesInv
from .serializers import *
from rest_framework.response import Response
from django.db import transaction
from rest_framework.exceptions import ValidationError
from .filters import*
from rest_framework.decorators import api_view
from Tax_Service.serilazers import get_now
from user.wraps import *
from .invoicepdf import generate_pdf
from projectpfe.utils.response import *

class ValidateInvoice(generics.UpdateAPIView):
    def update(self, request, *args, **kwargs):
        
            with transaction.atomic():
                 type_validation=kwargs['invoice_type']
                 serializer= vlaidatedInvoiceSerializerOne(data=request.data)
                 serializer.is_valid(raise_exception=True)
                 ids=serializer.validated_data['ids']
                 #validated_by=request.user_id
       
                
                     
                 match type_validation:
                           case "v_contract": 
                                nbi=Invoice.objects.filter(contract__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now())
               
                           case "v_client":
                                nbi=Invoice.objects.filter(contract__client__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now())  
                           case "v_product_type":
                                nbi=Invoice.objects.filter(contract__product_type__id__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now())
                           case "v_all":
                                nbi=Invoice.objects.filter(states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now())
                           case "v_id":
                                nbi=Invoice.objects.filter(id__in=ids , states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now())
                                  
                 return Response({"data":"Invoices validated successfully","nbr invoice validated":nbi})
             
class InvoiceValidatedList(generics.ListAPIView):
    
    def get(self, request, *args, **kwargs):
        clients = Client.objects.filter(client_contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
        product_types = ProductType.objects.filter(contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()

        response = {
            "clients": clientSerializerOne(clients, many=True).data,
            "product_types": ProductTypeSerializer(product_types, many=True).data
        }

        return success_response(data=response, message=" data pour la validation ",status_code=200)
        
             

class InvoiceList(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
         
        
        queryset=Invoice.objects.select_related('contract__client').all()
        serializer_class=InvoiceFilterSerializerOne
        filterset_class=InvoiceFilter 
        queryset = filterset_class(request.GET, queryset=queryset).qs
        paginator = MyPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = serializer_class(page, many=True)
        response = paginated_response( paginator=paginator ,  serializer=serializer )  
        return  success_response(data=response , message="filter  successfully",status_code=200)
   
   
   
   
   
@api_view(['GET'])
@jwt_must
def invoicepdf(request, id):
     try:
     
     

          try:
               invoice = Invoice.objects.get(id=id, states = StatesInv.NO_VALID)

               if request.role == 'client' and invoice.contract.client_id != request.user_id:  # type: ignore
                    return error_response(
                         message="Order does not exist or you do not have permission", status_code=400)

               return generate_pdf(id)

          except Invoice.DoesNotExist:
               return error_response(
                    message="invoice does not exist yet or you do not have permission" ,status_code=400
               )
     except Exception as e:
          
          return error_response(message="Unexpected error",errors=str(e),status_code=400)