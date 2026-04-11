from rest_framework import serializers
from rest_framework.response import Response
from .models import Order,OrderProduct
from catalog.models import Client,Contract,ProductType,Product
from django.db import transaction
from django.shortcuts import get_object_or_404
from finance.views import check_if_enough
from order_client.models import OrderProductclient
from django.db import models
from Invoices.models import Invoice , States


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
        fields=["id","qte","unit","order","product" ]
   
 
 
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
        fields=['contract','client','client_order','order_orderProduct_items']
    def validate(self, data):
        
        
        
        if data['contract'].client.id != data['client'].id or data['contract'].state!="validated" :
            raise serializers.ValidationError('This client does not have this contract.')
        
        product_type_id=data['contract'].product_type.id
    
        for product in data['order_orderProduct_items']:
            if product['product'].product_type.id != product_type_id:
                raise serializers.ValidationError('This contract does not include this type of product.') 
           
        return super().validate(data)   
    
    def create(self, validated_data):
        
        with transaction.atomic():
            
             invoice=Invoice.objects.filter(contract=validated_data['contract'],states=States.NO_VALID)
             if not invoice :
                 invoice=Invoice( contract=validated_data['contract'] )
                 invoice.save()
                 
             order_items=validated_data.pop( 'order_orderProduct_items' )
             order=Order(**validated_data,invoice=invoice)
             order.save()
             
             for order_item in order_items:
                 orderProduct=OrderProduct(
                 product=order_item['product'],
                 qte=order_item['qte'],
                 unit=order_item['unit'],
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
                invoice=Invoice.objects.filter(id=order.invoice.id,states=States.NO_VALID).first()
                if not invoice:
                    invoice=Invoice.objects.create(
                        contract=order.contract,
                        type=validated_data['type_choise']
                    )
                order_items=validated_data.pop('order_orderProduct_items')
                newOrder=Order.objects.create(
                    contract=order.contract,
                    client=order.client,
                    parent_order=order,
                    type=validated_data['type_choise'],
                    invoice=invoice
                )
                
                for order_item in order_items :
                    orderProduct=OrderProduct(
                       product=order_item['product'],
                       qte=order_item['qte'],
                       unit=order_item['unit'],
                       order=newOrder,  
                    )
                    orderProduct.save()
                return newOrder   
   
            
#serializer for list validated orders            
class ValidateOrdersSerializer(serializers.Serializer):
    ids=serializers.ListField(child=serializers.IntegerField(),allow_empty=False)      