from django.urls import path, include
from .views.sidewalkView import SidewalkView
from .views.adminView import AdminAccountView
from .views.pedestrianView import PedestrianView
from rest_framework import routers

router = routers.DefaultRouter()
router.register('sidewalk', SidewalkView, 'sidewalk')
router.register('pedestrian', PedestrianView)
router.register('adminAccount', AdminAccountView)

urlpatterns = [
    path('',include(router.urls))
]