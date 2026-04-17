from rest_framework import serializers
from rest_framework.response import Response
from .models import *
from catalog.models import Client,Contract,ProductType,Product
from django.db import transaction
from django.shortcuts import get_object_or_404
from finance.views import check_if_enough

from datetime import date


#serializer for client contract order productType filter
class ProductTypeFilterSerializerOne(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = ['name']

class OrderFilterSerializerOne(serializers.ModelSerializer):
    class Meta:
        model = Orderclient
        fields = ['id', 'type', 'states', 'date_created','parent_order']
           
class ContractFilterSerializerOne(serializers.ModelSerializer):
    contract_order_items = OrderFilterSerializerOne(many=True)
    product_type = ProductTypeFilterSerializerOne(read_only=True)

    class Meta:
        model = Contract
        fields = ['id', 'product_type', 'contract_order_items']

class ClientFilterSerializerOne(serializers.ModelSerializer):
    client_contracts = ContractFilterSerializerOne(many=True)

    class Meta:
        model = Client
        fields = ['id', 'firstName', 'lastName','phoneNumber','client_contracts']
        

        
    
        
   




#serializer for orderProduct with product name filter
class ProductFilterSerializerOne(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields=['name']

class OrderProductFilterSerializerOne(serializers.ModelSerializer):
    product=ProductFilterSerializerOne(many=False)
    class Meta:
        model=OrderProductclient
        fields=["id", "type","qte","unit","states","order","product" ]
   
 
 
#serializer for orders filter
class ClientFilterSerializerTow(serializers.ModelSerializer):
    class Meta:
        model=Client
        fields=['id','firstName','lastName','phoneNumber']
        
class ContractFilterSerializerTow(serializers.ModelSerializer):
    product_type = ProductTypeFilterSerializerOne(read_only=True)
    class Meta:
        model=Contract
        fields=['id','product_type']
        
        
class OrderFilterSerializerTow(serializers.ModelSerializer):
       client=ClientFilterSerializerTow(many=False)
       contract=ContractFilterSerializerTow(many=False)
       class Meta:
           model=Orderclient
           fields=['client','contract']
           


#----------------------------------------------------------------------------------------------------
class OrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        model=OrderProductclient
        fields=['product','qte','qte_taken','unit']
        extra_kwargs = {
         "qte_taken": {"read_only": True},
}
        
class OrderSerializer(serializers.ModelSerializer):
    orderclient_Orderproductclient_items=OrderProductSerializer(many=True)
    class Meta:
        model=Orderclient
        fields=['contract','orderclient_Orderproductclient_items']
        
        
    def validate_orderclient_Orderproductclient_items(self, value):
       total_qte = 0
       total_price = 0
       
       for item in value:
           qte = item.get('qte', 0)
           product = item.get('product')

           total_qte += qte 
           total_price += product.unit_price * qte   #order (1)

       self.total_qte = total_qte
       self.total_price = total_price

       return value
        
    def validate(self, data):
        request_user_id = self.context.get('user_id') 
        
        contract = data.get('contract')
        total_qte = getattr(self, 'total_qte', 0)
        total_price = getattr(self, 'total_price', 0)
        
        
        if not contract:
            raise serializers.ValidationError("contract must be provided")
        
        if contract.client.id != request_user_id :
            raise serializers.ValidationError("You cannot place an order for another client's contract")

        if contract.state != 'validated':
            raise serializers.ValidationError("contract is not validated")
        for item in data.get('orderclient_Orderproductclient_items'):
           product = item.get('product')
           if product.product_type != contract.product_type:
               raise serializers.ValidationError(f"product {product.id } is not included in the contract")
    

        print(  total_qte)
        print(contract.qte_rest())
        print(type(total_qte), total_qte)
        print(type(contract.qte_rest()), contract.qte_rest())
        if total_qte > contract.qte_rest():
            print('karim')
            raise serializers.ValidationError(
                f"declared quantity ({ self.total_qte}) is larger than the quantity left in the contract ({contract.qte_rest()})"
            )
        print(total_price)
        check = check_if_enough(total_price,request_user_id,contract.product_type)
        print('karim2')
        if not check['success']:
            raise serializers.ValidationError(check['message'])
            

        return data
            
                
    def create(self, validated_data):
        
        with transaction.atomic():
             order_items=validated_data.pop( 'orderclient_Orderproductclient_items' )
             order=Orderclient.objects.create(**validated_data)
             
             for order_item in order_items:
                 orderProduct=OrderProductclient(
                 product=order_item['product'],
                 qte=order_item['qte'],
                 order=order,
                 ) 
                 orderProduct.save()
        
        return order 
##~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
class OrderProductreadSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source="product.name")
    class Meta:
        model=OrderProductclient
        fields=['product','qte','unit','qte_taken']
        
class OrderreadSerializer(serializers.ModelSerializer):
    client = serializers.CharField(source ="client.lastName")
    client_id = serializers.CharField(source ="client.id")
    orderclient_Orderproductclient_items = OrderProductreadSerializer(many=True)

    class Meta:
        model=Orderclient
        fields = ['id', 'client_id','date_created', 'contract', 'client','orderclient_Orderproductclient_items','state','pickup_date', 'validated_by']


class ClientreadSerializer(serializers.ModelSerializer):
    numberOrders = serializers.SerializerMethodField()
    client_id = serializers.IntegerField(source='id')
    
    

    class Meta:
        model = Client
        fields = ['client_id', 'firstName', 'lastName','numberOrders']
        extra_kwargs = {
         "FirstName": {"read_only": True},
         "lastName": {"read_only": True},
         "numberOrders": {"read_only": True}
}
        
    def get_numberOrders(self, obj):
        return obj.client_Ordersclient_items.count()
#=============================================================================================================     
class ValidateOrdersSerializer(serializers.Serializer):
    id=serializers.IntegerField()  
    state = serializers.CharField()
    pickup_date = serializers.DateField()
    
    def validate_pickup_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Pickup date cannot be in the past.")
        return value
    
    def validate_state(self, value):
          
          
          STATES = ["pending","validated","rejected"]
          if not value in STATES:
              raise serializers.ValidationError("state does not exist ")
          return value

    def validate(self, data):
        try:
            order = Orderclient.objects.get(id = data.get('id'))
        except Orderclient.DoesNotExist:
             raise serializers.ValidationError("order does not not  exist ")
        
        return data
    