from rest_framework_json_api import serializers
from .models import Sidewalk, SidewalkRating, Pedestrian, SidewalkComment, SidewalkImage, AdminAccount

class SidewalkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sidewalk
        fields = ('id',)

    
class SidewalkRatingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SidewalkRating
        fields = '__all__'

class PedestrianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedestrian
        fields = '__all__'

class SidewalkCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SidewalkComment
        fields = '__all__'

class SidewalkImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SidewalkImage
        fields = '__all__'

class AdminAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminAccount
        fields = '__all__'