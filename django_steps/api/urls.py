from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('sidewalk', views.SidewalkView, 'sidewalk')
router.register('pedestrian', views.PedestrianView)
router.register('adminAccount', views.AdminAccountView)

urlpatterns = [
    path('',include(router.urls))
]