from django.urls import path
from . import views
urlpatterns = [
    path('create/',views.OrderCreateView.as_view()),
    path('validat/',views.OrderValidateView.as_view()),
    path('rectificative/',views.RectificativeOrderView.as_view()),
    path('<int:type>/', views.OrderListView.as_view()),
    path('invalid',views.inValid)
    
]