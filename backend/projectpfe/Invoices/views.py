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
from django.utils.decorators import method_decorator
from rest_framework import serializers

@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['Admin', 'superAdmin']), name='dispatch')
class ValidateInvoice(generics.UpdateAPIView):
    @transaction.atomic()
    def update(self, request, *args, **kwargs):
            
            
            type_validation=kwargs['invoice_type']
            serializer= vlaidatedInvoiceSerializerOne(data=request.data)
            serializer.is_valid(raise_exception=True)
            ids=serializer.validated_data['ids']
            user=request.user_id
            role=request.role
     
           
            if role=='superAdmin':  
                   
               match type_validation:
                      case "v_contract": 
                           nbi=Invoice.objects.filter(contract__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_client":
                           nbi=Invoice.objects.filter(contract__client__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)  
                      case "v_product_type":
                           nbi=Invoice.objects.filter(contract__product_type__id__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_all":
                           nbi=Invoice.objects.filter(states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_id":
                           nbi=Invoice.objects.filter(id__in=ids , states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                           
            elif role=='Admin':
                 
               match type_validation:
                      case "v_contract": 
                           nbi=Invoice.objects.filter(contract__in=ids,contract__client__manager=user,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_client":
                           nbi=Invoice.objects.filter(contract__client__in=ids,contract__client__manager=user,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)  
                      case "v_product_type":
                           nbi=Invoice.objects.filter(contract__product_type__id__in=ids,contract__client__manager=user,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_all":
                           nbi=Invoice.objects.filter(states=StatesInv.NO_VALID,contract__client__manager=user).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_id":
                           nbi=Invoice.objects.filter(id__in=ids ,contract__client__manager=user , states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)    
            else:
               raise  serializers.ValidationError(" The is role not exist ")     
                                  
            return Response({"data":"Invoices validated successfully","nbr invoice validated":nbi})
 
 
 
 
 
@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['Admin', 'superAdmin']), name='dispatch')             
class InvoiceValidatedList(generics.ListAPIView):
    
    def list(self, request, *args, **kwargs):
        role=request.role
        user=request.user_id
        if role =='superAdmin':
           clients = Client.objects.filter(client_contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
           product_types = ProductType.objects.filter(contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
           
        elif role=='Admin':
             clients=Client.objects.filter(manager=user,client_contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
             product_types = ProductType.objects.filter(contracts__client__manager=user,contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
        response = {
            "clients": clientSerializerOne(clients, many=True).data,
            "product_types": ProductTypeSerializer(product_types, many=True).data
           }     
        return success_response(data=response, message=" data pour la validation ",status_code=200)
     
     
        
 
 
 
 
 
             
@method_decorator(jwt_must, name='dispatch')
@method_decorator(role_required(['client','Admin', 'superAdmin']), name='dispatch')

class InvoiceList(generics.ListAPIView):
     
    serializer_class = InvoiceFilterSerializerOne
    filterset_class  = InvoiceFilter
    pagination_class = MyPagination
     
    def list(self, request, *args, **kwargs):
         
        role=request.role
        user=request.user_id
        
        if role=='superAdmin':
             self.queryset=Invoice.objects.select_related('contract__client').all()
        elif role=='Admin':
             self.queryset=Invoice.objects.select_related('contract__client').filter(contract__client__manager=user).all()
        elif role=='client':
             self.queryset=Invoice.objects.select_related('contract__client').filter(contract__client__id=user , states=StatesInv.VALID).all()
        else:
             raise serializers.ValidationError("The role not exist")  
             
        
        response = super().list(request, *args, **kwargs) 
         
        return  success_response(data=response.data , message="filter  successfully",status_code=200)
   
   
   
   
   
@api_view(['GET'])
@jwt_must
def invoicepdf(request, id):
     try:
     
     

          try:
               invoice = Invoice.objects.get(id=id, states = StatesInv.VALID)

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