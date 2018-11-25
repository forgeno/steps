from rest_framework.test import APITestCase
import unittest
from unittest.mock import patch
from django.db import connection

from api.models import Sidewalk, SidewalkRating
from api.views.sidewalkView import SidewalkView

# Tests for posting a rating to a sidewalk
class PostRatingTests(APITestCase):
	def setUp(self):
		self.sidewalk = Sidewalk.objects.create(address="aaa").__dict__
		
	def test_post_rating_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.sidewalk["id"]) + "/rate/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_post_rating_null_sidewalk(self):
		response = self.client.post("/api/sidewalk/9999/rate/", {}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_rating_missing_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/rate/", {'accessibility': 0}, format='json')
		self.assertEqual(response.status_code, 400)
		
	def test_post_rating_negative_value(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/rate/", {'accessibility': -5, 'comfort': 0, 'connectivity': 0, 'physicalSafety': 0, 'senseOfSecurity': 0}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_rating_large_value(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/rate/", {'accessibility': 3, 'comfort': 4.5, 'connectivity': 5.1, 'physicalSafety': 0, 'senseOfSecurity': 0}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_rating_string_value(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/rate/", {'accessibility': 3, 'comfort': 4.5, 'connectivity': "3.6", 'physicalSafety': 0, 'senseOfSecurity': 0}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_rating_success(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/rate/", {'accessibility': 3, 'comfort': 4.5, 'connectivity': 3.1, 'physicalSafety': 1.6, 'senseOfSecurity': 1.5}, format='json')
		self.assertEqual(response.status_code, 200)

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalk")

class TestRatingsCount(unittest.TestCase):
	def setUp(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalk2 = Sidewalk.objects.create(address="aaa").__dict__
		self.instance = SidewalkView()
	
	def test_fake_sidewalk(self):
		self.assertEqual(self.instance._getRatingsCount(999929), 0)
	
	def test_with_no_ratings(self):
		self.assertEqual(self.instance._getRatingsCount(self.sidewalk1["id"]), 0)
		
	def test_with_diff_sidewalk_rating(self):
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertEqual(self.instance._getRatingsCount(self.sidewalk2["id"]), 0)
		
	def test_one_rating(self):
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertEqual(self.instance._getRatingsCount(self.sidewalk1["id"]), 1)
		
	def test_two_ratings(self):
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertEqual(self.instance._getRatingsCount(self.sidewalk1["id"]), 2)
		
	def test_hundred_ratings(self):
		for i in range(0, 100):
			SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
				comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertEqual(self.instance._getRatingsCount(self.sidewalk1["id"]), 100)
	
	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalk")

class TestAvgOverallRating(unittest.TestCase):
	def setUp(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalk2 = Sidewalk.objects.create(address="aaa").__dict__
		self.instance = SidewalkView()
	
	@patch("api.views.sidewalkView.SidewalkView._avgIndivRating")
	def test_no_ratings(self, ratingMock):
		ratingMock.return_value = [0, 0, 0, 0, 0]
		self.assertEqual(self.instance._avgOverallRating(), 0)
	
	@patch("api.views.sidewalkView.SidewalkView._avgIndivRating")
	def test_one_rating(self, ratingMock):
		ratingMock.return_value = [1.0, 1.5, 0.7, 2.0, 4.5]
		self.assertEqual(self.instance._avgOverallRating(), 1.94)
	
	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalk")

class TestIndividualOverallRatings(unittest.TestCase):
	def setUp(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalk2 = Sidewalk.objects.create(address="aaa").__dict__
		self.instance = SidewalkView()
	
	def test_no_ratings(self):
		self.assertCountEqual(self.instance._avgIndivRating(), [0, 0, 0, 0, 0])
		
	def test_one_rating(self):
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertCountEqual(self.instance._avgIndivRating(), [1.0, 0.7, 1.5, 2.0, 4.5])
		
	def test_two_ratings_same_sidewalk(self):
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=4.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertCountEqual(self.instance._avgIndivRating(), [1.0, 2.7, 1.5, 2, 4.5])
	
	def test_two_ratings_diff_sidewalks(self):
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk2["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=4.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertCountEqual(self.instance._avgIndivRating(), [1, 2.7, 1.5, 2, 4.5])
	
	def test_hundred_ratings(self):
		for i in range(0, 100):
			SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1, 
				comfort_rating=1, connectivity_rating=4, physical_safety_rating=3, security_rating=3.55)
		self.assertCountEqual(self.instance._avgIndivRating(), [1, 4, 1, 3, 3.55])
	
	def test_zero_ratings(self):
		for i in range(0, 100):
			SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=0, 
				comfort_rating=0, connectivity_rating=0, physical_safety_rating=0, security_rating=0)
		self.assertCountEqual(self.instance._avgIndivRating(), [0, 0, 0, 0, 0])
	
	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalk")

class GetRatingTests(APITestCase):
	def setUp(self):
		self.sidewalk = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalkNoRatings = Sidewalk.objects.create(address="aaa").__dict__
		
	def test_with_post(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/ratings/", {}, format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_sidewalk_no_ratings(self):
		response = self.client.get("/api/sidewalk/" + str(self.sidewalkNoRatings["id"]) + "/ratings/", format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["overallRating"], 0)
		self.assertEqual(response.data["accessibility"], 0)
		self.assertEqual(response.data["connectivity"], 0)
		self.assertEqual(response.data["comfort"], 0)
		self.assertEqual(response.data["physicalSafety"], 0)
		self.assertEqual(response.data["senseOfSecurity"], 0)
		self.assertEqual(response.data["totalRatings"], 0)

	def test_sidewalk_with_ratings(self):
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=4.7, physical_safety_rating=2.0, security_rating=4.5)
		response = self.client.get("/api/sidewalk/" + str(self.sidewalk["id"]) + "/ratings/", format='json')
		self.assertEqual(response.status_code, 200)

		self.assertEqual(response.data["overallRating"], 2.34)
		self.assertEqual(response.data["accessibility"], 1.0)
		self.assertEqual(response.data["connectivity"], 2.7)
		self.assertEqual(response.data["comfort"], 1.5)
		self.assertEqual(response.data["physicalSafety"], 2)
		self.assertEqual(response.data["senseOfSecurity"], 4.5)
		self.assertEqual(response.data["totalRatings"], 2)

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalk")
