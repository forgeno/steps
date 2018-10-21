from django.db import models

class Pedestrian(models.Model):
    longitude = models.DecimalField(max_digits=18, decimal_places=14)
    latitude = models.DecimalField(max_digits=18, decimal_places=14)
    recorded_time = models.CharField(max_length=255)
    speed = models.CharField(max_length=255)
    activity_title = models.CharField(max_length=255)
    activity_confidence = models.IntegerField()
    crosswalk = models.BooleanField()
    waiting_time = models.CharField(max_length=255)

class Sidewalk(models.Model):
    address = models.CharField(max_length=255)

class SidewalkComment(models.Model):
    sidewalk = models.ForeignKey(Sidewalk, on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    posted_time = models.DateTimeField(auto_now_add=True)

class SidewalkImage(models.Model):
    sidewalk = models.ForeignKey(Sidewalk, on_delete=models.CASCADE)
    image_url = models.CharField(max_length=255)
    posted_time = models.DateTimeField(auto_now_add=True)
    is_pending = models.BooleanField()

class SidewalkRating(models.Model):
    sidewalk = models.ForeignKey(Sidewalk, on_delete=models.CASCADE)
    accessibility_rating = models.FloatField()
    connectivity_rating = models.FloatField()
    comfort_rating = models.FloatField()
    physical_safety_rating = models.FloatField()
    security_rating = models.FloatField()

class AdminAccount(models.Model):
    username = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    password = models.CharField(max_length=64)
