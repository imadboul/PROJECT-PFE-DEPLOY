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
        try:
            with transaction.atomic():
                 serializer= vlaidatedInvoiceSerializer(data=request.data)
                 serializer.is_valid(raise_exception=True)
                 ids=serializer.validated_data['ids']
                 #validated_by=request.user_id
                 nbi=Invoice.objects.filter(id__in=ids,states=StatesInv.NO_VALID).update(States=StatesInv.VALID,date_de_facteration=get_now())
                 return Response({"data":"Invoices validated successfully","nbr invoice validated":nbi})
             
        except ValidationError:
            raise
        except Exception as e:
                 return Response({"error":"Failed validated Invoices"}) 
             

class InvoiceList(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
        type=kwargs['type']
        if type==1:
            self.queryset=Invoice.objects.select_related('contract__client').all()
            self.serializer_class=InvoiceFilterSerializerTow
            self.filterset_class=InvoiceFilter
        
        
        
        
        
        
        
        
        
        return super().get(request, *args, **kwargs)