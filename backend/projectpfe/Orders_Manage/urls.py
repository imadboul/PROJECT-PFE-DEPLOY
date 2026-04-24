from django.urls import path
from .views import *
urlpatterns = [
    path('create/',OrderCreateView.as_view()),
    path('validated/<str:validate_type>/',OrderValidateView.as_view()),
    path('rectificative/<str:rectification_type>/',RectificativeOrderView.as_view()),
    path('filter/', OrderListView.as_view()),
    path('invalid/',inValid)
    
]