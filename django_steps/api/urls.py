from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('sidewalk', views.SidewalkView)
router.register('sidewalkRating', views.SidewalkRatingView)
router.register('pedestrian', views.PedestrianView)
router.register('sidewalkComment', views.SidewalkCommentView)
router.register('sidewalkImage', views.SidewalkImageView)
router.register('adminAccount', views.AdminAccountView)

urlpatterns = [
    path('',include(router.urls))
]
