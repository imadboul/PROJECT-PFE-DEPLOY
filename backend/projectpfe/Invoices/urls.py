from django.urls import path
from .views import *
urlpatterns = [
    path('validate/<str:invoice_type>',ValidateInvoice.as_view()),
    path('filter/<int:invoice_type>/',InvoiceList.as_view()),
    path('invoicePDF/<int:id>/', invoicepdf)
]
