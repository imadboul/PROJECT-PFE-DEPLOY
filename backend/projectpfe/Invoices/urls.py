from django.urls import path
from .views import *
urlpatterns = [
    path('validate/',ValidateInvoice.as_view()),
    path('filter/<int:type>/',InvoiceList.as_view())
]
