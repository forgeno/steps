from django.test import TestCase
from rest_framework.test import APIRequestFactory, APITestCase
from rest_framework import status
from django.urls import include, path, reverse

from api.models import Sidewalk, SidewalkRating, SidewalkComment, SidewalkImage, AdminAccount
from django.utils.dateparse import parse_datetime

from unittest.mock import patch
import cloudinary

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
	
	# def _setupSidewalkUsername(self):
	# 	AdminAccount.objects.create(username = "joe", password = "kevin")


	def setUp(self):
		self.s1 = Sidewalk.objects.create(address="abcdefg").__dict__
		self.s2 = Sidewalk.objects.create(address="aweaweaweaweaweaweaweaweawe").__dict__
		self.s3 = Sidewalk.objects.create(address="aaa").__dict__
		self.s4 = Sidewalk.objects.create(address="aaa").__dict__
		self.s5 = Sidewalk.objects.create(address="aaa").__dict__
		
		self._setupRatings()
		self._setupComments()
		self._setupImages()
		# self._setupSidewalkUsername()
		
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
		
		# validate ordering of comments to make sure most recent ones are first
		currentIndex = 99
		for comment in list(response.data["comments"]):
			i = int(comment["text"])
			self.assertEqual(currentIndex, i)
			currentIndex -= 1
		
		# make sure the loop was actually iterated through
		self.assertTrue(currentIndex < 99)
		
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
	
	def test_post_comment_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.s4["id"]) + "/comment/create/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_post_comment_null_sidewalk(self):
		response = self.client.post("/api/sidewalk/9999/comment/create/", {'text': "abcdefgh"}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_comment_numeric_text(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/comment/create/", {'text': 25}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_comment_no_text(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/comment/create/", {}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_comment_too_long(self):
		text = ""
		for i in range(0, 100):
			text += "aaaaaaaaaaaaaaaaaaaa"
		
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/comment/create/", {'text': text}, format='json')
		self.assertEqual(response.status_code, 400)
	
	# TODO; make this
	#def test_post_comment_inappropriate(self):
	#	text = ""
	#	response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/comment/create/", {'text': text}, format='json')
	#	self.assertEqual(response.status_code, 400)
	
	# TODO: make this
	#def test_post_comment_personal_info(self):
	#	text = ""
	#	response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/comment/create/", {'text': text}, format='json')
	#	self.assertEqual(response.status_code, 400)
	
	def test_post_comment(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/comment/create/", {'text': "a test comment"}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["text"], "a test comment")

	def test_post_image_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.s4["id"]) + "/image/create/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_post_image_null_sidewalk(self):
		response = self.client.post("/api/sidewalk/9999/image/create/", {'image': "abcdefgh"}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_image_no_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/create/", {}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_image_too_large(self):
		image = ""
		for i in range(0, 350000):
			image += "aaaaaaaaaa"
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/create/", {'image': image}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_image_not_string(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/create/", {'image': 25}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_image_cloudinary_error(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/create/", {'image': "aBcDefGhiKl029391212"}, format='json')
		self.assertEqual(response.status_code, 500)

	@patch("cloudinary.uploader.upload")
	def test_post_image(self, uploadMock):
		uploadMock.return_value = {'url': 'abcdefghijkl', 'public_id': 'xaIOJokko'}
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/create/", {'image': "aBcDefGhiKl029391212"}, format='json')
		self.assertEqual(response.status_code, 200)

	def test_get_sidewalk_images_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.s4["id"]) + "/image/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_get_sidewalk_images_null(self):
		response = self.client.post("/api/sidewalk/9999/image/", {'startIndex': 1, 'endIndex': 25} ,format='json')
		self.assertEqual(response.status_code, 200)

	def test_get_sidewalk_images_end_lt_start(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/", {'startIndex': 1, 'endIndex': 0} ,format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_get_sidewalk_images_negative_start(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/", {'startIndex': -1, 'endIndex': 0} ,format='json')
		self.assertEqual(response.status_code, 400)
		
	def test_get_sidewalk_images_negative_end(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/", {'startIndex': -5, 'endIndex': -1} ,format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_get_sidewalk_images_missing_end(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/", {'startIndex': 0} ,format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_get_sidewalk_images_missing_start(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/", {'endIndex': 0} ,format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_get_sidewalk_images_empty(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/", {'startIndex': 0, 'endIndex': 25} ,format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data["images"]), 0)
		self.assertFalse(response.data["hasMoreImages"])
		
	def test_get_sidewalk_images_same_start_end(self):
		response = self.client.post("/api/sidewalk/" + str(self.s1["id"]) + "/image/", {'startIndex': 0, 'endIndex': 0} ,format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data["images"]), 1)
		self.assertEqual(response.data["images"][0]["id"], self.i1["id"])
		self.assertEqual(response.data["images"][0]["url"], self.i1["image_url"])
		self.assertFalse(response.data["hasMoreImages"])

	def test_get_sidewalk_images_multiple(self):
		response = self.client.post("/api/sidewalk/" + str(self.s2["id"]) + "/image/", {'startIndex': 0, 'endIndex': 9} ,format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data["images"]), 10)
		
		# verify the images are in descending order
		prevIndex = -1
		for image in response.data["images"]:
			if prevIndex == -1:
				prevIndex = int(image["id"])
			else:
				self.assertTrue(int(image["id"]) < prevIndex)
		
		# make sure the loop was executed
		self.assertTrue(prevIndex != -1)
		self.assertTrue(response.data["hasMoreImages"])

	def test_post_rating_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.s4["id"]) + "/rate/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_post_rating_null_sidewalk(self):
		response = self.client.post("/api/sidewalk/9999/rate/", {}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_rating_missing_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/rate/", {'accessibility': 0}, format='json')
		self.assertEqual(response.status_code, 400)
		
	def test_post_rating_negative_value(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/rate/", {'accessibility': -5, 'comfort': 0, 'connectivity': 0, 'physicalSafety': 0, 'senseOfSecurity': 0}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_rating_large_value(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/rate/", {'accessibility': 3, 'comfort': 4.5, 'connectivity': 5.1, 'physicalSafety': 0, 'senseOfSecurity': 0}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_rating_string_value(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/rate/", {'accessibility': 3, 'comfort': 4.5, 'connectivity': "3.6", 'physicalSafety': 0, 'senseOfSecurity': 0}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_rating_success(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/rate/", {'accessibility': 3, 'comfort': 4.5, 'connectivity': 3.1, 'physicalSafety': 1.6, 'senseOfSecurity': 1.5}, format='json')
		self.assertEqual(response.status_code, 200)

	def test_delete_image_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.s4["id"]) + "/image/delete/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_delete_image_null_sidewalk(self):
		response = self.client.post("/api/sidewalk/9999/image/delete/", {'username': 'u', 'password': 'p', 'imageId': self.i5['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_delete_image_missing_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/delete/", {'username': 'u', 'password': 'p'}, format='json')
		self.assertEqual(response.status_code, 400)

	# TODO: add support for this
	#def test_delete_image_invalid_credentials(self):
	#	response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/delete/", {'username': 's', 'password': 'p', 'imageId': self.i5['id']}, format='json')
	#	self.assertEqual(response.status_code, 401)
		
	def test_delete_image_invalid_image(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/delete/", {'username': 'u', 'password': 'p', 'imageId': -6}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_delete_image_valid_wrong_sidewalk(self):
		response = self.client.post("/api/sidewalk/" + str(self.s3["id"]) + "/image/delete/", {'username': 'u', 'password': 'p', 'imageId': self.i5['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_delete_image_valid(self):
		response = self.client.post("/api/sidewalk/" + str(self.s5["id"]) + "/image/delete/", {'username': 'u', 'password': 'p', 'imageId': self.i5['id']}, format='json')
		self.assertEqual(response.status_code, 200)


class SidewalkAgrregateTests(APITestCase):
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
	
	def _setupSidewalkUsername(self):
		AdminAccount.objects.create(username = "joe", password = "kevin")

	def setUp(self):
		self.s1 = Sidewalk.objects.create(address="abcdefg").__dict__
		self.s2 = Sidewalk.objects.create(address="aweaweaweaweaweaweaweaweawe").__dict__
		self.s3 = Sidewalk.objects.create(address="aaa").__dict__
		self.s4 = Sidewalk.objects.create(address="aaa").__dict__
		self.s5 = Sidewalk.objects.create(address="aaa").__dict__
		
		self._setupRatings()
		self._setupComments()
		self._setupImages()
		self._setupSidewalkUsername()

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

	#sidewalk/id/comment Tests
	def test_get_sidewalk_comment_invalid_endIndex(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/comment/", {'startIndex': 10, 'endIndex': 3}, format='json')
		self.assertEqual(response.status_code, 400)

	def test_get_sidewalk_comment_valid(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/comment/", {'startIndex': 10, 'endIndex': 30}, format='json')
		self.assertEqual(response.status_code, 200)
	
	#sidewalk/id/image/respond
	def test_pending_image_valid(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/respond/", {'username': 'joe', 'password': 'kevin', 'accepted': True}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_pending_image_Invalid_credentials(self):
		response = self.client.post("/api/sidewalk/" + str(self.s4["id"]) + "/image/respond/", {'username': 'u', 'password': 'p', 'accepted': True}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_pending_image_valid_credentials_id(self):
		response = self.client.post("/api/sidewalk/" + str(self.s5["id"]) + "/image/respond/", {'username': 'joe', 'password': 'kevin', 'accepted': True}, format='json')
		self.assertEqual(response.status_code, 200)
	
	#sidewalk/unapprovedImages
	def test_unapproved_Images_Invalid_credentials(self):
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'u', 'password': 'p', 'offsetIndex': 3}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_unapproved_Images_valid_credentials(self):
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'joe', 'password': 'kevin', 'offsetIndex': 3}, format='json')
		self.assertEqual(response.status_code, 200)

	def test_unapproved_Images_valid_credentials_negative_offset(self):
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'joe', 'password': 'kevin', 'offsetIndex': -3}, format='json')
		self.assertEqual(response.status_code, 400)
	

class AdminTests(APITestCase):	
	def __setupUsername(self):
		AdminAccount.objects.create(username = "joe", password = "kevin")
	
	def setUp(self):
		self.__setupUsername()
	
	#adminAccount/login
	def test_valid_login_invalid(self):
		response = self.client.post("/api/adminAccount/login/", {'username': 'u', 'password': 'p'}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_valid_login(self):
		response = self.client.post("/api/adminAccount/login/", {'username': 'joe', 'password': 'kevin'}, format='json')
		self.assertEqual(response.status_code, 200)

def tearDown(self):
	with connection.cursor() as cursor:
		cursor.execute("DELETE FROM api_sidewalk")
		cursor.execute("DELETE FROM api_sidewalkcomment")
		cursor.execute("DELETE FROM api_sidewalkrating")
		cursor.execute("DELETE FROM api_sidewalkimage")
		cursor.execute("DELETE FROM api_adminaccount")
	
class SidewalkCommentTests(APITestCase):
	def setUp(self):
		self.sidewalkNoComments =  Sidewalk.objects.create(address="abcdefg").__dict__
		self.sidewalkWithComments = Sidewalk.objects.create(address="abcdefg").__dict__
		self.comment = SidewalkComment.objects.create(sidewalk_id=self.sidewalkWithComments["id"], text="abcdefghij").__dict__
	
	def test_delete_comment_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_delete_comment_null_sidewalk(self):
		response = self.client.post("/api/sidewalk/9999/comment/delete/", {'username': 'u', 'password': 'p', 'id': self.comment['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_delete_comment_missing_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", {'username': 'u', 'password': 'p'}, format='json')
		self.assertEqual(response.status_code, 400)

	# TODO: add support for this
	#def test_delete_comment_invalid_credentials(self):
	#	response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", {'username': 's', 'password': 'p', 'id': self.comment['id']}, format='json')
	#	self.assertEqual(response.status_code, 401)
		
	def test_delete_comment_invalid_comment(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", {'username': 'u', 'password': 'p', 'id': -6}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_delete_comment_valid_wrong_sidewalk(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkNoComments["id"]) + "/comment/delete/", {'username': 'u', 'password': 'p', 'id': self.comment['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_delete_comment_valid(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", {'username': 'u', 'password': 'p', 'id': self.comment['id']}, format='json')
		self.assertEqual(response.status_code, 200)
		response2 = self.client.get("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/", format='json')
		self.assertEqual(response2.data["totalComments"], 0)
