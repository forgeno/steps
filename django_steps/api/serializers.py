from rest_framework_json_api import serializers
from .models import Sidewalk, Pedestrian, SidewalkComment, SidewalkImage, AdminAccount

class SidewalkSerializer(serializers.ModelSerializer):
	class Meta:
		model = Sidewalk
		fields = '__all__'

class SidewalkListSerializer(serializers.ModelSerializer):
	accessibility = serializers.FloatField()
	comfort = serializers.FloatField()
	connectivity = serializers.FloatField()
	senseOfSecurity = serializers.FloatField()
	physicalSafety = serializers.FloatField()
	class Meta:
		model = Sidewalk
		fields = ('id', 'address', 'accessibility', 'comfort', 'connectivity', 'senseOfSecurity', 'physicalSafety')

class PedestrianSerializer(serializers.ModelSerializer):
	class Meta:
		model = Pedestrian
		fields = '__all__'

class SidewalkImageSerializer(serializers.ModelSerializer):
	url = serializers.CharField(source='image_url')
	date = serializers.DateTimeField(source='posted_time')
	class Meta:
		model = SidewalkImage
		fields = ('id', 'url', 'date')

class SidewalkCommentSerializer(serializers.ModelSerializer):
	date = serializers.DateTimeField(source='posted_time')
	class Meta:
		model = SidewalkComment
		fields = ('id', 'text', 'date')

class AdminAccountSerializer(serializers.ModelSerializer):
	class Meta:
		model = AdminAccount
		fields = '__all__'