from rest_framework import viewsets
from ..models import (Pedestrian)
from ..serializers import (PedestrianSerializer)
from .viewUtils import LoginUtil

class PedestrianView(viewsets.ReadOnlyModelViewSet):
	queryset = Pedestrian.objects.raw("""SELECT * FROM api_pedestrian""")
	serializer_class = PedestrianSerializer
	allowed_methods = ['GET']
	http_method_names = ['get']
