from django.shortcuts import render
from rest_framework import viewsets
from .models import Sidewalk, SidewalkRating, Pedestrian, SidewalkComment, SidewalkImage, AdminAccount
from .serializers import SidewalkSerializer, SidewalkRatingsSerializer, PedestrianSerializer, SidewalkCommentSerializer, SidewalkImageSerializer, AdminAccountSerializer

class SidewalkView(viewsets.ModelViewSet):
    queryset = Sidewalk.objects.all()
    serializer_class = SidewalkSerializer
    allowed_methods = ['GET']
    http_method_names = ['get']


class SidewalkRatingView(viewsets.ModelViewSet):
    queryset = SidewalkRating.objects.all()
    serializer_class = SidewalkRatingsSerializer
    allowed_methods = ['GET']
    http_method_names = ['get']

class PedestrianView(viewsets.ModelViewSet):
    queryset = Pedestrian.objects.all()
    serializer_class = PedestrianSerializer
    allowed_methods = ['GET']
    http_method_names = ['get']

class SidewalkCommentView(viewsets.ModelViewSet):
    queryset = SidewalkComment.objects.all()
    serializer_class = SidewalkCommentSerializer
    allowed_methods = ['GET']
    http_method_names = ['get']
    
class SidewalkImageView(viewsets.ModelViewSet):
    queryset = SidewalkImage.objects.all()
    serializer_class = SidewalkImageSerializer
    allowed_methods = ['GET']
    http_method_names = ['get']
    
class AdminAccountView(viewsets.ModelViewSet):
    queryset = AdminAccount.objects.all()
    serializer_class = AdminAccountSerializer
    allowed_methods = ['GET']
    http_method_names = ['get']
    