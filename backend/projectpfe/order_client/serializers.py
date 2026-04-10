from rest_framework import serializers
from rest_framework.response import Response
from .models import *
from catalog.models import Client,Contract,ProductType,Product
from django.db import transaction
from django.shortcuts import get_object_or_404
from finance.views import check_if_enough


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
        fields=['product','qte']
        
class OrderSerializer(serializers.ModelSerializer):
    products=OrderProductSerializer(many=True)
    class Meta:
        model=Orderclient
        fields=['contract','products']
        
        
    def validate_products(self, value):
       total_qte = 0
       total_price = 0

       for item in value:
           qte = item.get('qte', 0)
           product = item.get('product')

           total_qte += qte
           total_price += product.unit_price * qte

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
        
        if contract.client.id != request_user_id:
            raise serializers.ValidationError("You cannot place an order for another client's contract")

        if contract.state != 'validated':
            raise serializers.ValidationError("contract is not validated")
    

        print(  total_qte)
        print(contract.qte_rest())
        if  total_qte > contract.qte_rest():
            raise serializers.ValidationError(
                f"declared quantity ({ self.total_qte}) is larger than the quantity left in the contract ({contract.qte_rest()})"
            )
        
        check = check_if_enough(total_price,request_user_id,contract.product_type)
        if not check['success']:
            raise serializers.ValidationError(check['message'])
            

        return data
            
                
    def create(self, validated_data):
        
        with transaction.atomic():
             order_items=validated_data.pop( 'products' )
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

class OrderreadSerializer(serializers.ModelSerializer):
    client = serializers.CharField(source ="client.lastName")
    products=OrderProductSerializer(many=True)

    class Meta:
        model=Orderclient
        fields='__all__'

            
#=============================================================================================================     
class ValidateOrdersSerializer(serializers.Serializer):
    id=serializers.IntegerField()  
    state = serializers.CharField()
    
    def validate_state(self, value):
          
          
          STATES = ["pending","validated","rejected"]
          if not value in STATES:
              raise serializers.ValidationError("state does not exist ")
          return value

    def validate(self, data):
        try:
            order = Orderclient.objects.get(id = data.get('id'))
        except Orderclient.DoesNotExist:
             raise serializers.ValidationError("order does not exist ")
        
        return data
    