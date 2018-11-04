from rest_framework.test import APITestCase
from django.db import connection

from api.models import Sidewalk, SidewalkRating

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
