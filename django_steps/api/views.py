from django.shortcuts import render
from rest_framework import viewsets
from .models import Sidewalk
from .serializers import SidewalkSerializer

class SidewalkView(viewsets.ModelViewSet):
    queryset = Sidewalk.objects.all()
    serializer_class = SidewalkSerializer
    allowed_methods = ['GET']
