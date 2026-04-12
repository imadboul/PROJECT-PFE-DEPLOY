from django.urls import path
from .views import *
urlpatterns = [
    path('create/',OrderCreateView.as_view()),
    path('validat/',OrderValidateView.as_view()),
    path('rectificative/',RectificativeOrderView.as_view()),
    path('<int:type>/', OrderListView.as_view()),
    path('invalid',inValid)
    
]