from django.contrib import admin
from django.urls import path
# from .views import AboutPage
from . import views
from django.urls import include, path


urlpatterns = [
    # path('admin/', admin.site.urls),
    path('', views.index)
]
