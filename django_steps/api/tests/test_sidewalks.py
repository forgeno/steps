from rest_framework.test import APITestCase
from rest_framework import status
from django.utils.dateparse import parse_datetime
from django.db import connection

from unittest.mock import patch

from api.models import Sidewalk, SidewalkRating, SidewalkComment, SidewalkImage
import api.views.viewUtils

# Integration tests for the endpoints that retrieve summary information about sidewalks
class SidewalkTests(APITestCase):
	def _setupRatings(self):
		SidewalkRating.objects.create(sidewalk_id=self.s1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		
		self.totalAccess = 0
		self.totalComfort = 0
		self.totalConnect = 0
		self.totalSafety = 0
		self.totalSecurity = 0
		for i in range(0, 100):
			access = (i * 92) % 5
			comfort = i % 5
			connect = (i + 3) % 5
			safety = (i + 1) % 3
			security = (i + 2) % 5
			
			self.totalAccess += access
			self.totalComfort += comfort
			self.totalConnect += connect
			self.totalSafety += safety
			self.totalSecurity += security
			
			SidewalkRating.objects.create(sidewalk_id=self.s2["id"], accessibility_rating=access,
				comfort_rating=comfort, connectivity_rating=connect, physical_safety_rating=safety, security_rating=security)

	def _setupComments(self):
		self.c1 = SidewalkComment.objects.create(sidewalk_id=self.s1["id"], text="abcdefghij").__dict__
		self.c2 = SidewalkComment.objects.create(sidewalk_id=self.s1["id"], text="ab").__dict__
		
		for i in range(0, 100):
			SidewalkComment.objects.create(sidewalk_id=self.s2["id"], text=str(i))
	
	def _setupImages(self):
		self.i5 = SidewalkImage.objects.create(sidewalk_id=self.s5["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False).__dict__
		self.i1 = SidewalkImage.objects.create(sidewalk_id=self.s1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False).__dict__
		for i in range(0, 11):
			self.i2 = SidewalkImage.objects.create(sidewalk_id=self.s2["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending = False).__dict__
		
		for i in range(0, 11):
			SidewalkImage.objects.create(sidewalk_id=self.s3["id"], image_url="http://127.0.0.1/somewhere.jpg").__dict__

	def setUp(self):
		self.s1 = Sidewalk.objects.create(address="abcdefg").__dict__
		self.s2 = Sidewalk.objects.create(address="aweaweaweaweaweaweaweaweawe").__dict__
		self.s3 = Sidewalk.objects.create(address="aaa").__dict__
		self.s4 = Sidewalk.objects.create(address="aaa").__dict__
		self.s5 = Sidewalk.objects.create(address="aaa").__dict__
		
		self._setupRatings()
		self._setupComments()
		self._setupImages()
		
	def test_post_all_sidewalks(self):
		response = self.client.post("/api/sidewalk/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_get_all_sidewalks(self):
		response = self.client.get("/api/sidewalk/", format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 5)
		
		# find each sidewalk in the response data list
		f1 = list(filter(lambda x : x["id"] == self.s1["id"], response.data))[0]
		f2 = list(filter(lambda x : x["id"] == self.s2["id"], response.data))[0]
		f3 = list(filter(lambda x : x["id"] == self.s3["id"], response.data))[0]
		self.assertIsNotNone(f1)
		self.assertIsNotNone(f2)
		self.assertIsNotNone(f3)
		
		# tests first sidewalk's ratings (one rating)
		self.assertEqual(f1["overallRating"], 1.94)
		self.assertEqual(f1["accessibility"], 1.0)
		self.assertEqual(f1["comfort"], 1.5)
		self.assertEqual(f1["connectivity"], 0.7)
		self.assertEqual(f1["physicalSafety"], 2.0)
		self.assertEqual(f1["senseOfSecurity"], 4.5)
		
		# tests second sidewalk's ratings (100 ratings)
		self.assertEqual(f2["overallRating"], (self.totalAccess + self.totalComfort + self.totalConnect + self.totalSafety + self.totalSecurity) / 500)
		self.assertEqual(f2["accessibility"], self.totalAccess / 100)
		self.assertEqual(f2["comfort"], self.totalComfort / 100)
		self.assertEqual(f2["connectivity"], self.totalConnect / 100)
		self.assertEqual(f2["physicalSafety"], self.totalSafety / 100)
		self.assertEqual(f2["senseOfSecurity"], self.totalSecurity / 100)
		
		# tests third sidewalk's ratings (it has no ratings set)
		self.assertEqual(f3["overallRating"], 0)
		self.assertEqual(f3["accessibility"], 0)
		self.assertEqual(f3["comfort"], 0)
		self.assertEqual(f3["connectivity"], 0)
		self.assertEqual(f3["physicalSafety"], 0)
		self.assertEqual(f3["senseOfSecurity"], 0)

	def test_post_sidewalk(self):
		response = self.client.post("/api/sidewalk/999999/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_get_first_sidewalk(self):
		response = self.client.get("/api/sidewalk/" + str(self.s1["id"]) + "/", format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["totalRatings"], 1)
		self.assertEqual(response.data["id"], self.s1["id"])
		self.assertEqual(response.data["address"], self.s1["address"])
		
		# tests comments
		self.assertEqual(response.data["totalComments"], 2)
		self.assertEqual(len(response.data["comments"]), 2)
		self.assertEqual(response.data["comments"][0]["id"], self.c2["id"])
		self.assertEqual(response.data["comments"][0]["text"], self.c2["text"])
		self.assertEqual(parse_datetime(response.data["comments"][0]["date"]), self.c2["posted_time"])
		self.assertEqual(response.data["comments"][1]["id"], self.c1["id"])
		self.assertEqual(response.data["comments"][1]["text"], self.c1["text"])
		self.assertEqual(parse_datetime(response.data["comments"][1]["date"]), self.c1["posted_time"])
		
		self.assertEqual(response.data["lastImage"]["url"], self.i1["image_url"])
		self.assertEqual(response.data["totalImages"], 1)
		
		# TODO
		#self.assertEqual(response.data["averageVelocity"], 0)
		#self.assertEqual(response.data["mobilityTypeDistribution"], [])
	
	def test_get_second_sidewalk(self):
		response = self.client.get("/api/sidewalk/" + str(self.s2["id"]) + "/", format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["totalRatings"], 100)
		self.assertEqual(response.data["id"], self.s2["id"])
		self.assertEqual(response.data["address"], self.s2["address"])
		
		# tests comments
		self.assertEqual(response.data["totalComments"], 100)
		self.assertEqual(len(response.data["comments"]), 25)
		
		self.assertEqual(response.data["lastImage"]["url"], self.i2["image_url"])
		self.assertEqual(response.data["totalImages"], 11)
		
		# TODO
		# self.assertEqual(response.data["averageVelocity"], 0)
		# self.assertEqual(response.data["mobilityTypeDistribution"], [])
	
	def test_get_third_sidewalk(self):
		response = self.client.get("/api/sidewalk/" + str(self.s3["id"]) + "/", format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["totalRatings"], 0)
		self.assertEqual(response.data["id"], self.s3["id"])
		self.assertEqual(response.data["address"], self.s3["address"])
		
		# tests comments
		self.assertEqual(response.data["totalComments"], 0)
		self.assertEqual(len(response.data["comments"]), 0)
		
		# no images because they are pending
		self.assertEqual(response.data["lastImage"], None)
		self.assertEqual(response.data["totalImages"], 0)		

		# TODO
		#self.assertEqual(response.data["averageVelocity"], 0)
		#self.assertEqual(response.data["mobilityTypeDistribution"], [])

	def test_get_null_sidewalk(self):
		response = self.client.get("/api/sidewalk/995292/", format='json')
		self.assertEqual(response.status_code, 404)
		
	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkcomment")
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")

class SidewalkAggregateTests(APITestCase):
	def _setupComments(self):
		self.c1 = SidewalkComment.objects.create(sidewalk_id=self.s1["id"], text="abcdefghij").__dict__
		self.c2 = SidewalkComment.objects.create(sidewalk_id=self.s1["id"], text="ab").__dict__
		self.c3 = SidewalkComment.objects.create(sidewalk_id=self.s2["id"], text="anything").__dict__
		self.c4 = SidewalkComment.objects.create(sidewalk_id=self.s4["id"], text="2anything").__dict__
	
	def _setupImages(self):
		self.i5 = SidewalkImage.objects.create(sidewalk_id=self.s5["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False).__dict__
		self.i1 = SidewalkImage.objects.create(sidewalk_id=self.s1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False).__dict__
	
	def _setupRatings(self):
		SidewalkRating.objects.create(sidewalk_id=self.s1["id"], accessibility_rating=0.5, 
			comfort_rating=1.5, connectivity_rating=1.5, physical_safety_rating=1.0, security_rating=4.5)

		SidewalkRating.objects.create(sidewalk_id=self.s2["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=4.0, physical_safety_rating=2.5, security_rating= 2.0)

		SidewalkRating.objects.create(sidewalk_id=self.s3["id"], accessibility_rating=1.5, 
			comfort_rating=2.0, connectivity_rating=4.5, physical_safety_rating=3.0, security_rating=4.5)
		
		SidewalkRating.objects.create(sidewalk_id=self.s3["id"], accessibility_rating=1.5, 
			comfort_rating=2.0, connectivity_rating=2.5, physical_safety_rating=3.0, security_rating=4.5)

		SidewalkRating.objects.create(sidewalk_id=self.s4["id"], accessibility_rating=2.5, 
			comfort_rating=3.5, connectivity_rating=4.5, physical_safety_rating=5.0, security_rating=4.5)

		SidewalkRating.objects.create(sidewalk_id=self.s5["id"], accessibility_rating=5.0, 
			comfort_rating=1.5, connectivity_rating=2.5, physical_safety_rating=3.5, security_rating=4.0)
	
	def setUp(self):
		self.s1 = Sidewalk.objects.create(address="abcdefg").__dict__
		self.s2 = Sidewalk.objects.create(address="aweaweaweaweaweaweaweaweawe").__dict__
		self.s3 = Sidewalk.objects.create(address="aaa").__dict__
		self.s4 = Sidewalk.objects.create(address="aaa").__dict__
		self.s5 = Sidewalk.objects.create(address="aaa").__dict__
		
		self._setupRatings()
		self._setupComments()
		self._setupImages()

	#sidewalk/summary
	def test_get_sidewalks_summary(self):
		response = self.client.get("/api/sidewalk/summary/", format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["totalSidewalks"], 5)
		self.assertEqual(response.data["totalRatings"], 6)
		self.assertEqual(response.data["totalComments"], 4)
		self.assertEqual(response.data["totalImagesUploaded"], 2)
		self.assertEqual(response.data["averageOverallRating"], 14.25)
		self.assertEqual(len(response.data["contributionsByMonth"]), 1)
		self.assertEqual(response.data["averageRatings"]["accessibility"], 2)
		self.assertEqual(response.data["averageRatings"]["connectivity"], 3.25)
		self.assertEqual(response.data["averageRatings"]["comfort"], 2)
		self.assertEqual(response.data["averageRatings"]["physical safety"], 3)
		self.assertEqual(response.data["averageRatings"]["security"], 4)

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkcomment")
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")