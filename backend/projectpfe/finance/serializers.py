from rest_framework import serializers
from .models import *


class balanceserializer(serializers.ModelSerializer):
    productType = serializers.CharField(source="productType.name")
    client = serializers.CharField(source ="client.lastName")
    
    class Meta:
        model =  Balance
        fields = '__all__'
        
        
class paymentserializer(serializers.Serializer):
      id = serializers.IntegerField()
      state = serializers.CharField()
      def validate_state(self, value):
          
          
          STATES = ["pending","validated","rejected"]
          if not value in STATES:
              raise serializers.ValidationError("state does not exist ")
          return value
            

      def validate(self, data):
          
          try:
               Payment.objects.get(id = data.get('id'), state='pending')
          except Payment.DoesNotExist:
              raise serializers.ValidationError(" payment does not exist or already validated or rejected")
          return data
        

class paymentreadserializer(serializers.ModelSerializer):
    productType = serializers.CharField(source="productType.name")
    client = serializers.CharField(source ="client.lastName")

    class Meta:
        model = Payment
        fields = '__all__'
    
    
    
class paymentcreateserializer(serializers.ModelSerializer):
    
    class Meta:
        model =  Payment
        fields = '__all__'
        extra_kwargs = {
            "id" : {"read_only": True},
            "created_at": {"read_only": True},
            "client" : {"read_only": True},
            "state":{"read_only": True},
            "validated_by": {"read_only": True},
            }
    def validate_amount(self, value):
        if value < 10:
            raise serializers.ValidationError("minimum is 10 DA")
        
        if value > 1_000_000_000:  
            raise serializers.ValidationError("amount too large")
        
        return value
        
    def validate(self,data):
         amount = data.get('amount')
         product_type = data.get('productType')
         
         if amount < 10 :
            raise serializers.ValidationError({
                "amount": "minimum is 10 DA"
            })
         if not product_type or not product_type.id:
             raise serializers.ValidationError({
                "product_type": f"product type with id {product_type} does not exist"
            })

            
         return data
     

             
             
         


        
    

