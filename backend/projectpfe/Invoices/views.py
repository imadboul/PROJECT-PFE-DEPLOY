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
from Orders_Manage.models import Order,States
from order_client.models import Orderclient
from Tax_Service.taxCalcul import facturation 



class ValidateInvoice(generics.UpdateAPIView):
     
    @class_jwt_must
    @class_role_required(['admin', 'superAdmin'])
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
                           orders=Order.objects.filter(contract__in=ids,states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(contract__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_client":
                           print(ids)
                           orders=Order.objects.filter(client__in=ids,states=States.VALID)
                           print(orders)
                           
                           facturation(orders)
                           nbi=Invoice.objects.filter(contract__client__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)  
                      case "v_product_type":
                           orders=Order.objects.filter(contract__product_type__in=ids,states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(contract__product_type__id__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_all":
                           orders=Order.objects.filter(states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_id":
                           orders=Order.objects.filter(invoice__in=ids,states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(id__in=ids , states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                           
            elif role=='admin':
                 
               match type_validation:
                      case "v_contract": 
                           orders=Order.objects.filter(contract__in=ids,client__manager=user,states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(contract__in=ids,contract__client__manager=user,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_client":
                           orders=Order.objects.filter(client__in=ids,client__manager=user,states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(contract__client__in=ids,contract__client__manager=user,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)  
                      case "v_product_type":
                           orders=Order.objects.filter(contract__product_type__in=ids,client__manager=user,states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(contract__product_type__id__in=ids,contract__client__manager=user,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_all":
                           orders=Order.objects.filter(client__manager=user,states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(states=StatesInv.NO_VALID,contract__client__manager=user).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)
                      case "v_id":
                           orders=Order.objects.filter(invoice__in=ids,client__manager=user,states=States.VALID)
                           facturation(orders)
                           nbi=Invoice.objects.filter(id__in=ids ,contract__client__manager=user , states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now(),validated_by=user)    
            else:
               raise  serializers.ValidationError(" The is role not exist ")     
                                  
            return Response({"data":"Invoices validated successfully","nbr invoice validated":nbi})
 

class InvoicedOrNewInvoice(generics.CreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoicedOrNewInvoiceSerializer
    @class_jwt_must
    @class_role_required(['admin', 'superAdmin'])
    @transaction.atomic
    def create(self,request,*args,**kwargs):
            user=request.user_id
            
            invoice_type=kwargs['invoice_type']
            serializer=self.get_serializer(data=request.data,context={'invoice_type': invoice_type,'user':user , })
            serializer.is_valid(raise_exception=True)
            
            self.perform_create(serializer)
            
            if invoice_type=="invoiced":
                 return success_response(data=None,message=' invoiced successfully',status_code=201) 
            elif invoice_type=="new_invoice":
                 return success_response(data=None,message=' create new invoice successfully',status_code=201)
            else :
                 raise serializers.ValidationError(" error invoice_type not exist in url ") 
     
 
 
   
class InvoiceValidatedList(generics.ListAPIView):

    @class_jwt_must
    @class_role_required(['admin', 'superAdmin'])    
    def list(self, request, *args, **kwargs):
        role=request.role
        user=request.user_id
        if role =='superAdmin':
           clients = Client.objects.filter(client_contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
           product_types = ProductType.objects.filter(contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
           
        elif role=='admin':
             clients=Client.objects.filter(manager=user,client_contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
             product_types = ProductType.objects.filter(contracts__client__manager=user,contracts__contract_invoice_items__states=StatesInv.NO_VALID).distinct()
        response = {
            "clients": clientSerializerOne(clients, many=True).data,
            "product_types": ProductTypeSerializer(product_types, many=True).data
           }     
        return success_response(data=response, message=" data pour la validation ",status_code=200)
     
     
        
 
 
 
 
 
             


class InvoiceList(generics.ListAPIView):
     
    serializer_class = InvoiceFilterSerializerOne
    filterset_class  = InvoiceFilter
    pagination_class = MyPagination
    @class_jwt_must
    @class_role_required(['client','admin', 'superAdmin'])
    def list(self, request, *args, **kwargs):
         
        role=request.role
        user=request.user_id
        
        if role=='superAdmin':
             self.queryset=Invoice.objects.select_related('contract__client').all()
        elif role=='admin':
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
     
     


