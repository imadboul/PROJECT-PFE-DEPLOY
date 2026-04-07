from rest_framework import serializers
from rest_framework.response import Response
from .models import Order,OrderProduct
from catalog.models import Client,Contract,ProductType,Product
from django.db import transaction
from django.shortcuts import get_object_or_404


#serializer for client contract order productType filter
class ProductTypeFilterSerializerOne(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = ['name']

class OrderFilterSerializerOne(serializers.ModelSerializer):
    class Meta:
        model = Order
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
        model=OrderProduct
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
           model=Order
           fields=['client','contract']


#serializer for save order and orderProduct and rectificative 
class OrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        model=OrderProduct
        fields=['product','qte','unit']
        
class OrderSerializer(serializers.ModelSerializer):
    order_orderProduct_items=OrderProductSerializer(many=True)
    class Meta:
        model=Order
        fields=['contract','client','order_orderProduct_items']
    
    def create(self, validated_data):
        
        with transaction.atomic():
             order_items=validated_data.pop( 'order_orderProduct_items' )
             order=Order.objects.create(**validated_data)
             
             for order_item in order_items:
                 orderProduct=OrderProduct(
                 product=order_item['product'],
                 qte=order_item['qte'],
                 unit=order_item['unit'],
                 type=order.type,
                 order=order,
                 ) 
                 orderProduct.save()
        
        return order 
    
class RectificativeOrderSerializer(serializers.ModelSerializer):
        Type_Choise=( ('plus') , ('mains')  , )
        order_orderProduct_items=OrderProductSerializer(many=True)
        id_parent=serializers.IntegerField(required=True)
        type_choise=serializers.ChoiceField(choices=Type_Choise)
        class Meta:
            model=Order
            fields=['id_parent','type_choise','order_orderProduct_items']
        
            
        def create(self,validated_data):
            order=get_object_or_404(Order,id=validated_data['id_parent'])
            with transaction.atomic():    
                order_items=validated_data.pop('order_orderProduct_items')
                newOrder=Order.objects.create(
                    contract=order.contract,
                    client=order.client,
                    parent_order=order,
                    type=validated_data['type_choise'],
                )
                
                for order_item in order_items :
                    orderProduct=OrderProduct(
                       product=order_item['product'],
                       qte=order_item['qte'],
                       unit=order_item['unit'],
                       type=newOrder.type,
                       order=newOrder,  
                    )
                    orderProduct.save()
                return newOrder   
   
            
#serializer for list validated orders            
class ValidateOrdersSerializer(serializers.Serializer):
    ids=serializers.ListField(child=serializers.IntegerField(),allow_empty=False)      