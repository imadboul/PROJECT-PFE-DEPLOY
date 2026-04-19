from django.urls import path
from .views import *
urlpatterns = [
    path('validate/<str:invoice_type>/',ValidateInvoice.as_view()),
    path('filter/',InvoiceList.as_view()),
    path('invoicePDF/<int:id>/', invoicepdf),
    path('invoicedata/', InvoiceValidatedList.as_view())
]
