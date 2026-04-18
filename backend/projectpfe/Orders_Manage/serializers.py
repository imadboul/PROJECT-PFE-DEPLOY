from rest_framework import serializers
from rest_framework.response import Response
from .models import Order,OrderProduct
from catalog.models import Client,Contract,ProductType,Product
from django.db import transaction
from django.shortcuts import get_object_or_404
from finance.views import check_if_enough
from order_client.models import OrderProductclient,Orderclient
from django.db import models
from Invoices.models import Invoice , StatesInv
from order_client.models import *
from Tax_Service.taxCalcul import convert_unit
from user.views import notify_a_client

  




#serializer for orderProduct with product name filter
class ProductFilterSerilazer(serializers.ModelSerializer):
    product_type=serializers.CharField(source='product_type.name',read_only=True)
    class Meta:
        model=Product
        fields=['id','name','product_type']
class OrderProductFilterSerializerOne(serializers.ModelSerializer):
    product = ProductFilterSerilazer(many=False)
    class Meta:
        model=OrderProduct
        fields=["id","qte","unit","order","product" ]

class OrderFilterSerializerThri(serializers.ModelSerializer):
    order_orderProduct_items=OrderProductFilterSerializerOne(many=True)
    client_firstName=serializers.CharField(source='client.firstName',read_only=True)
    client_lastName=serializers.CharField(source='client.lastName',read_only=True)
    validated_by=serializers.SerializerMethodField()
    def get_validated_by(self, obj):
       return obj.validated_by.firstName if obj.validated_by else None
    class Meta:
        model = Order
        fields = ['id', 'client_firstName','client_lastName', 'date_created','contract','type', 'states','validated_by','client_order','parent_order','invoice','order_orderProduct_items']   

 



#serializer for save order and orderProduct 
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
            raise serializers.ValidationError("contract no valide ou contract de notre client ")
        
        qte=0
        for item_order in data['order_orderProduct_items']:
            qte+=convert_unit(item_order['qte'],item_order['product'].density,item_order['unit'],data['contract'].unit)
         
        
        
        product_type_id=data['contract'].product_type.id
        
        for product in data['order_orderProduct_items']:
            
            if product['product'].product_type.id != product_type_id:
                raise serializers.ValidationError(f"c'est product {product['product'].name} n'appartie pas a type de product")
        
        order_client=Orderclient.objects.filter(id=data['client_order'].id).first()  
        
        if not order_client:
            raise serializers.ValidationError("c'est order client n'exists pas ")
        
        for item_client in order_client.orderclient_Orderproductclient_items.all():
            
            test=False
            for item_order in data['order_orderProduct_items']:
                
                
                if item_client.product == item_order['product']:
                    test=True
            if not test:
                raise serializers.ValidationError(f"c'est product {item_order['product'].name}n'appratien pas a order client product ")
        

        

        
        return super().validate(data)   
    
    def create(self, validated_data):
        
        with transaction.atomic():
             
            
             invoice, created = Invoice.objects.get_or_create( contract=validated_data['contract'], states=StatesInv.NO_VALID)  
                 
             order_items=validated_data.pop( 'order_orderProduct_items' )
            
             order=Order.objects.create(**validated_data,invoice=invoice)
             
             print("bouklila")
             
             order_products = [
                       OrderProduct(
                       product=item['product'],
                       qte=item['qte'],
                       unit=item['unit'],
                       order=order )
                       for item in order_items  ]

             OrderProduct.objects.bulk_create(order_products)
             for unit in order_items:
                 
                    productorder = OrderProductclient.objects.get(product=unit['product'],order=validated_data['client_order'])

                    productorder.qte_taken += unit['qte']
                    productorder.save()
                 
                 
             Orderclient.objects.filter(id=order.client_order.id).update(state=States.LOADING)  
             notify_a_client( order.client.id ,title="transport",content=f" Mr. {order.client.firstName} {order.client.lastName} , your shipment has been successfully loaded from {order.contract.product_type.name} ",link='')
             
        return order
    
    
   
# rectificative order
class RectificativeOrderSerializer(serializers.ModelSerializer):
        Type_Choise=( ('plus') , ('mains')  , )
        order_orderProduct_items=OrderProductSerializer(many=True)
        id_parent=serializers.IntegerField(required=True)
        type_choise=serializers.ChoiceField(choices=Type_Choise)
        class Meta:
            model=Order
            fields=['id_parent','type_choise','order_orderProduct_items']
        
        def validate(self, data):
            
            order= Order.objects.filter(id=data['id_parent']).first()
            
            if not order:
                raise serializers.ValidationError("The parent order does not exist")
            
            orderProducts=order.order_orderProduct_items.all()
            name="None"
            
            for item1 in orderProducts:
                
                test=False
                for item2 in data['order_orderProduct_items']:
                    name=item2['product']
                    
                    if item1.product==item2['product']:
                        test=True
                        break
                    
                if not test:
                    raise serializers.ValidationError( f"The product '{name}' does not exist in the parent order.")
                
            return super().validate(data)
            
        def create(self,validated_data):
            
            
            order=get_object_or_404(Order,id=validated_data['id_parent'])
            
            
            with transaction.atomic():    
                
                invoice=Invoice.objects.filter(id=order.invoice.id,states=StatesInv.NO_VALID).first()
                
                if not invoice:
                    invoice=Invoice.objects.create( contract=order.contract, type=validated_data['type_choise'] )
                    
                    
                order_items=validated_data.pop('order_orderProduct_items')
                
                newOrder=Order.objects.create(
                    contract=order.contract,
                    client=order.client,
                    client_order=order.client_order,
                    parent_order=order,
                    type=validated_data['type_choise'],
                    invoice=invoice
                )
                
                
                orderProduct=[OrderProduct(
                    
                       product=order_item['product'],
                       qte=order_item['qte'],
                       unit=order_item['unit'],
                       order=newOrder,  
                    )
                    for order_item in order_items ]
                
                OrderProduct.objects.bulk_create(orderProduct)
                    
                return newOrder   
   
            
#serializer for list validated orders            
class ValidateOrdersSerializer(serializers.Serializer):
    ids=serializers.ListField(child=serializers.IntegerField(),allow_empty=False)      
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
"""#serializer for client contract order productType filter
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
        
"""
"""#serializer for orders filter
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
           """  