
from django.contrib import admin
from django.urls import path , include
from .views import product, producttype ,contract ,validatecontract , contractpdf
urlpatterns = [
    path('productType/',producttype),
    path('product/', product),
    path('contract/', contract),
    path('validateContract/', validatecontract),
    path('contractPDF/<int:id>', contractpdf),
]
