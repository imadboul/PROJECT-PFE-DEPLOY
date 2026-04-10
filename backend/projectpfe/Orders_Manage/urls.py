from django.urls import path
from .views import order , validateorder ,RectificativeOrder,get_order
urlpatterns = [
    path('order/',order),
    path('validateorder/',validateorder),
    path('rectificative/', RectificativeOrder),
    path('order/<int:id>', get_order)
    
]