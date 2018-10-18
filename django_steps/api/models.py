from django.db import models

class Sidewalk(models.Model):
    sidewalk_ID = models.CharField(max_length=128)
    address = models.CharField(max_length=255)

class SidewalkRatings(models.Model):
    accessibilityRating = models.FloatField()
    connectivityRating = models.FloatField()
    comfortRating = models.FloatField()
    safetyRating = models.FloatField()
    securityRating = models.FloatField()
    sidewalk = models.ForeignKey(Sidewalk, on_delete=models.CASCADE)

