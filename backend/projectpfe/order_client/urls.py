from django.urls import path
from .views import order , validateorder ,get_order,orderclientpdf , getclients
urlpatterns = [
    path('order/',order),
    path('validateorder/',validateorder),
    path('order/<int:id>', get_order),
    path('orderPDF/<int:id>', orderclientpdf),
    path('clients/', getclients)
    
]