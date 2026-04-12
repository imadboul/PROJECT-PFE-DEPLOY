
from django.contrib import admin
from django.urls import path , include
from .views import product, producttype ,contract ,validatecontract , contractpdf , get_contract
urlpatterns = [
    path('productType/',producttype),
    path('product/', product),
    path('contract/', contract),
    path('validateContract/', validatecontract),
    path('contractPDF/<int:id>', contractpdf),
    path('contract/<int:id>', get_contract),
]
