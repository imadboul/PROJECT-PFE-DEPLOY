from django.urls import path
from .views import *
urlpatterns = [
    path('create/',OrderCreateView.as_view()),
    path('validated/',OrderValidateView.as_view()),
    path('rectificative/',RectificativeOrderView.as_view()),
    path('filter/', OrderListView.as_view()),
    path('invalid',inValid)
    
]