from django.shortcuts import render
from rest_framework import generics
from .models import Tax,TaxProduct
from .serilazers import TaxSerializer
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response


class TaxSaveView(generics.CreateAPIView):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    def create(self, request, *args, **kwargs):
        try:
            serializer=self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({'data':'Tax created successfully'},status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({  "message": "Failed to create tax", "error": str(e)},status.HTTP_400_BAD_REQUEST)
    

    """ @transaction.atomic
    def perform_create(self, serializer):
        tax = serializer.save()
        tax_products_data = self.request.data.get('tax_taxProduct_items', [])
        for tax_product_data in tax_products_data:
            TaxProduct.objects.create(
                tax=tax,
                product=tax_product_data['product'],
                unit=tax_product_data['unit'],
                par_unit=tax_product_data['par_unit']
            )"""