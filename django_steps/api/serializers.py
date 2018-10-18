from rest_framework_json_api import serializers
from .models import Sidewalk

class SidewalkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sidewalk
        fields = ('sidewalk_ID',)

    
