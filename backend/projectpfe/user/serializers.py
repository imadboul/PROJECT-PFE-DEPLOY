from rest_framework import serializers
from .models import Client, Notification
from .auth import decode_jwt
from django.db import transaction

class ClientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Client
        fields = ["firstName", "lastName", "phoneNumber", "email", "password"]
    @transaction.atomic
    def create(self, validated_data):
        user_id = self.context.get('user_id') 
        manage=Client.objects.filter(id=user_id).first()
        password = validated_data.pop("password")
        client = Client(**validated_data)
        client.setpassword(password)
        client.manager=manage
        client.save()
        return client


 
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        exclude = ['user']  


class loginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        try:
            user = Client.objects.get(email=email)
        except Client.DoesNotExist:
            raise serializers.ValidationError("User not found")

        if not user.checkpassword(password):
            raise serializers.ValidationError("Incorrect password")

        if not user.email_verified:
            raise serializers.ValidationError("Email not verified")

        data['user'] = user
        return data


class RefreshTokenserializer(serializers.Serializer):
    refreshToken = serializers.CharField()

    def validate(self, data):
        token = data.get('refreshToken')

        refresh_token = decode_jwt(token)

        if not refresh_token or refresh_token == "expired" or refresh_token.get("type") != "refresh":
            raise serializers.ValidationError("Invalid or expired token")

        data['payload'] = refresh_token
        return data