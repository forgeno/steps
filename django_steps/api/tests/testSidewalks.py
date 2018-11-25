from rest_framework.test import APITestCase
from rest_framework import status
from django.utils.dateparse import parse_datetime
from django.db import connection
from datetime import datetime
import pytz

import unittest
from unittest.mock import patch

from api.models import Sidewalk, SidewalkRating, SidewalkComment, SidewalkImage
import api.views.viewUtils
from api.views.sidewalkView import SidewalkView

class MockResponse:
	def __init__(self, data):
		self.data = data

class SidewalkIntegrationTests(APITestCase):
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
	
	# integration test for all sidewalks
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
		self.assertEqual(f1["address"], self.s1["address"])
		
		# tests second sidewalk's ratings (100 ratings)
		self.assertEqual(f2["overallRating"], (self.totalAccess + self.totalComfort + self.totalConnect + self.totalSafety + self.totalSecurity) / 500)
		self.assertEqual(f2["accessibility"], self.totalAccess / 100)
		self.assertEqual(f2["comfort"], self.totalComfort / 100)
		self.assertEqual(f2["connectivity"], self.totalConnect / 100)
		self.assertEqual(f2["physicalSafety"], self.totalSafety / 100)
		self.assertEqual(f2["senseOfSecurity"], self.totalSecurity / 100)
		self.assertEqual(f2["address"], self.s2["address"])
		
		# tests third sidewalk's ratings (it has no ratings set)
		self.assertEqual(f3["overallRating"], 0)
		self.assertEqual(f3["accessibility"], 0)
		self.assertEqual(f3["comfort"], 0)
		self.assertEqual(f3["connectivity"], 0)
		self.assertEqual(f3["physicalSafety"], 0)
		self.assertEqual(f3["senseOfSecurity"], 0)
		self.assertEqual(f3["address"], self.s3["address"])

class SidewalkUnitTests(APITestCase):
	def setUp(self):
		self.s1 = Sidewalk.objects.create(address="abcdefg").__dict__
	
	def test_post_sidewalk(self):
		response = self.client.post("/api/sidewalk/999999/", format='json')
		self.assertEqual(response.status_code, 405)
	
	@patch("api.views.sidewalkView.SidewalkView._getImagesNoRequest")
	@patch("api.views.sidewalkView.SidewalkView._getRatingsCount")
	@patch("api.views.sidewalkView.SidewalkView._getCommentsCount")
	@patch("api.views.sidewalkView.SidewalkView._getCommentsNoRequest")
	def test_with_valid_fields(self, commentsMock, commentsCountMock, ratingsMock, imagesMock):
		COMMENTS = [{
			'id': 1,
			'text': "abcdefg",
			'posted_time': '2012-06-01T12:00:00'
		}, {
			'id': 2,
			'text': "2222abcdefg",
			'posted_time': '2011-06-01T12:00:00'
		}]
		imagesMock.return_value = MockResponse({"images": [{
			"url": "abc"
		}], "imageCount": 1})
		commentsCountMock.return_value = 25
		ratingsMock.return_value = 51
		commentsMock.return_value = MockResponse({"comments": COMMENTS})

		response = self.client.get("/api/sidewalk/" + str(self.s1["id"]) + "/", format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["totalRatings"], 51)
		self.assertEqual(response.data["id"], self.s1["id"])
		self.assertEqual(response.data["address"], self.s1["address"])
		self.assertEqual(response.data["totalComments"], 25)
		self.assertCountEqual(response.data["comments"], COMMENTS)
		self.assertEqual(response.data["lastImage"]["url"], "abc")
		self.assertEqual(response.data["totalImages"], 1)
		
		# TODO
		#self.assertEqual(response.data["averageVelocity"], 0)
		#self.assertEqual(response.data["mobilityTypeDistribution"], [])
	
	@patch("api.views.sidewalkView.SidewalkView._getCommentsCount")
	@patch("api.views.sidewalkView.SidewalkView._getCommentsNoRequest")
	def test_no_comments(self, commentsMock, commentsCountMock):
		commentsCountMock.return_value = 0
		commentsMock.return_value = MockResponse({"comments": []})
		
		response = self.client.get("/api/sidewalk/" + str(self.s1["id"]) + "/", format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["totalComments"], 0)
		self.assertEqual(len(response.data["comments"]), 0)

	@patch("api.views.sidewalkView.SidewalkView._getImagesNoRequest")
	def test_no_images(self, imagesMock):
		imagesMock.return_value = MockResponse({"images": [], "imageCount": 0})
		response = self.client.get("/api/sidewalk/" + str(self.s1["id"]) + "/", format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["lastImage"], None)
		self.assertEqual(response.data["totalImages"], 0)
	
	def test_get_null_sidewalk(self):
		response = self.client.get("/api/sidewalk/995292/", format='json')
		self.assertEqual(response.status_code, 404)
	
	#sidewalk/summary
	@patch("api.views.sidewalkView.SidewalkView._getFormattedContributions")
	@patch("api.views.sidewalkView.SidewalkView._getTotalCounts")
	@patch("api.views.sidewalkView.SidewalkView._avgIndivRating")
	@patch("api.views.sidewalkView.SidewalkView._avgOverallRating")
	def test_get_sidewalks_summary(self, overallRatingMock, ratingMock, totalCountsMock, contributionsMock):
		totalCountsMock.return_value = [5, 6, 4, 2]
		ratingMock.return_value = [2, 3.25, 2, 3, 4]
		overallRatingMock.return_value = 2.85
		contributionsMock.return_value = [{"monthYear": "8/2011", "contributions": 25}]

		response = self.client.get("/api/sidewalk/summary/", format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["totalSidewalks"], 5)
		self.assertEqual(response.data["totalRatings"], 6)
		self.assertEqual(response.data["totalComments"], 4)
		self.assertEqual(response.data["totalImagesUploaded"], 2)
		self.assertEqual(response.data["averageOverallRating"], 2.85)
		self.assertCountEqual(response.data["contributionsByMonth"], [{"monthYear": "8/2011", "contributions": 25}])
		self.assertEqual(response.data["averageRatings"]["accessibility"], 2)
		self.assertEqual(response.data["averageRatings"]["connectivity"], 3.25)
		self.assertEqual(response.data["averageRatings"]["comfort"], 2)
		self.assertEqual(response.data["averageRatings"]["physical safety"], 3)
		self.assertEqual(response.data["averageRatings"]["security"], 4)
	
	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalk")

class TestTotalCounts(unittest.TestCase):
	def setUp(self):
		self.instance = SidewalkView()
	
	def test_empty_db(self):
		self.assertCountEqual(self.instance._getTotalCounts(), [0, 0, 0, 0])
	
	def test_two_sidewalks(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalk2 = Sidewalk.objects.create(address="aaa").__dict__
		self.assertCountEqual(self.instance._getTotalCounts(), [2, 0, 0, 0])
		
	def test_one_rating(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalk2 = Sidewalk.objects.create(address="aaa").__dict__
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertCountEqual(self.instance._getTotalCounts(), [2, 1, 0, 0])
		
	def test_two_ratings_same_sidewalk(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=4.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertCountEqual(self.instance._getTotalCounts(), [1, 2, 0, 0])
	
	def test_two_ratings_diff_sidewalks(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalk2 = Sidewalk.objects.create(address="aaa").__dict__
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk2["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=4.7, physical_safety_rating=2.0, security_rating=4.5)
		self.assertCountEqual(self.instance._getTotalCounts(), [2, 2, 0, 0])
	
	def test_hundred_comments(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		for i in range(0, 100):
			SidewalkComment.objects.create(sidewalk_id=self.sidewalk1["id"], text="abcdefghij")
		self.assertCountEqual(self.instance._getTotalCounts(), [1, 0, 100, 0])
	
	def test_one_image(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False)
		self.assertCountEqual(self.instance._getTotalCounts(), [1, 0, 0, 1])
	
	def test_multiple_counts(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		for i in range(0, 25):
			Sidewalk.objects.create(address="aaa")
			SidewalkComment.objects.create(sidewalk_id=self.sidewalk1["id"], text="abcdefghij")
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False)
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False)
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False)
		self.assertCountEqual(self.instance._getTotalCounts(), [26, 0, 25, 3])
	
	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkcomment")
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")

class TestContributionsByMonth(unittest.TestCase):
	def setUp(self):
		self.sidewalk1 = Sidewalk.objects.create(address="aaa").__dict__
		self.instance = SidewalkView()
	
	def test_empty_db(self):
		self.assertCountEqual(self.instance._contributionsByMonth(), [])
	
	@patch("django.utils.timezone.now")
	def test_same_month(self, dateMock):
		dateMock.return_value = datetime(2012, 6, 1, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False)
		self.assertCountEqual(self.instance._contributionsByMonth(), [("6/2012", 2)])
	
	@patch("django.utils.timezone.now")
	def test_two_diff_months(self, dateMock):
		dateMock.return_value = datetime(2012, 5, 1, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		
		dateMock.return_value = datetime(2012, 6, 1, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False)
		SidewalkComment.objects.create(sidewalk_id=self.sidewalk1["id"], text="abcdefghij")
		self.assertCountEqual(self.instance._contributionsByMonth(), [("5/2012", 1), ("6/2012", 2)])
		
	@patch("django.utils.timezone.now")
	def test_diff_years_same_month(self, dateMock):
		dateMock.return_value = datetime(2011, 6, 1, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		
		dateMock.return_value = datetime(2012, 6, 1, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False)
		SidewalkComment.objects.create(sidewalk_id=self.sidewalk1["id"], text="abcdefghij")
		self.assertCountEqual(self.instance._contributionsByMonth(), [("6/2011", 1), ("6/2012", 2)])
		
	@patch("django.utils.timezone.now")
	def test_diff_years_diff_months(self, dateMock):
		dateMock.return_value = datetime(2011, 3, 1, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		
		dateMock.return_value = datetime(2012, 12, 1, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False)
		dateMock.return_value = datetime(2012, 10, 1, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkImage.objects.create(sidewalk_id=self.sidewalk1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=True)
		SidewalkRating.objects.create(sidewalk_id=self.sidewalk1["id"], accessibility_rating=1.0, 
			comfort_rating=1.5, connectivity_rating=0.7, physical_safety_rating=2.0, security_rating=4.5)
		
		dateMock.return_value = datetime(2010, 12, 5, 12, 1, 1, tzinfo=pytz.UTC)
		SidewalkComment.objects.create(sidewalk_id=self.sidewalk1["id"], text="abcdefghij")
		SidewalkComment.objects.create(sidewalk_id=self.sidewalk1["id"], text="abcdefghij")
		SidewalkComment.objects.create(sidewalk_id=self.sidewalk1["id"], text="abcdefghij")
		self.assertCountEqual(self.instance._contributionsByMonth(), [("3/2011", 1), ("12/2010", 3), ("10/2012", 2), ("12/2012", 1)])
	
	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkcomment")
			cursor.execute("DELETE FROM api_sidewalkrating")
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")
