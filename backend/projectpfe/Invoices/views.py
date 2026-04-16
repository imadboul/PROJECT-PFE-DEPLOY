from django.shortcuts import render
from rest_framework import generics
from .models import Invoice,StatesInv
from .serializers import *
from rest_framework.response import Response
from django.db import transaction
from rest_framework.exceptions import ValidationError
from .filters import*
from Tax_Service.serilazers import get_now

class ValidateInvoice(generics.UpdateAPIView):
    def update(self, request, *args, **kwargs):
        
            with transaction.atomic():
                 type_validation=kwargs['invoice_type']
                 
       
                 if type_validation=="v_product_type":
                      serializer=vlaidatedInvoiceSerializerTow(data=request.data)
                      serializer.is_valid(raise_exception=True)
                      products_type=serializer.validated_data['product_type']
                      #validated_by=request.user_id
                      nbi=Invoice.objects.filter(contract__product_type__name__in=products_type,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now()) 
                
                 elif type_validation in ("v_contract","v_client","v_id"):
                      serializer= vlaidatedInvoiceSerializerOne(data=request.data)
                      serializer.is_valid(raise_exception=True)
                      ids=serializer.validated_data['ids']
                      #validated_by=request.user_id
                      match type_validation:
                           case "v_contract": 
                                nbi=Invoice.objects.filter(contract__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now())
               
                           case "v_client":
                                nbi=Invoice.objects.filter(contract__client__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now())
                            
                           case "v_id" :
                                nbi=Invoice.objects.filter(id__in=ids,states=StatesInv.NO_VALID).update(states=StatesInv.VALID,date_de_facteration=get_now())
                                         
                 return Response({"data":"Invoices validated successfully","nbr invoice validated":nbi})
             

        
             

class InvoiceList(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
        type=kwargs['type']
        if type==1:
            self.queryset=Invoice.objects.select_related('contract__client').all()
            self.serializer_class=InvoiceFilterSerializerTow
            self.filterset_class=InvoiceFilter 
        return super().get(request, *args, **kwargs)