from rest_framework.test import APITestCase
from django.db import connection

from unittest.mock import patch
import cloudinary

from api.models import Sidewalk, SidewalkImage
import api.views.viewUtils

# Tests fetching pending images uploaded to sidewalks
class FetchPendingImageTests(APITestCase):
	def setUp(self):
		self.sidewalkPending = Sidewalk.objects.create(address="abcdefg").__dict__
		self.sidewalkNotPending = Sidewalk.objects.create(address="abcdefg").__dict__
		
		for i in range(0, 10):
			SidewalkImage.objects.create(sidewalk_id=self.sidewalkPending["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=True).__dict__
		
		for i in range(0, 10):
			SidewalkImage.objects.create(sidewalk_id=self.sidewalkNotPending["id"], image_url="http://127.0.0.1/NOT_PENDING.jpg", is_pending=False).__dict__
	
	#sidewalk/unapprovedImages
	def test_unapproved_Images_Invalid_credentials(self):
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'u', 'password': 'p', 'startIndex': 3, 'endIndex': 5}, format='json')
		self.assertEqual(response.status_code, 401)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_valid(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'joe', 'password': 'kevin', 'startIndex': 0, 'endIndex': 3}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertTrue(response.data["hasMoreImages"])
		self.assertEqual(len(response.data["images"]), 4)
		
		for image in list(response.data["images"]):
			self.assertFalse("NOT_PENDING" in image["url"])

	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_no_remaining_images(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'joe', 'password': 'kevin', 'startIndex': 0, 'endIndex': 25}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertFalse(response.data["hasMoreImages"])
		self.assertEqual(len(response.data["images"]), 10)
		
		for image in list(response.data["images"]):
			self.assertFalse("NOT_PENDING" in image["url"])
		
	def test_unapproved_Images_negative_start(self):
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'joe', 'password': 'kevin', 'startIndex': -3, 'endIndex': 0}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_unapproved_Images_negative_end(self):
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'joe', 'password': 'kevin', 'startIndex': -3, 'endIndex': -1}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_unapproved_Images_end_before_start(self):
		response = self.client.post("/api/sidewalk/unapprovedImages/", {'username': 'joe', 'password': 'kevin', 'startIndex': 5, 'endIndex': 3}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")

# Tests for uploading images to a sidewalk
class TestUploadImages(APITestCase):
	def setUp(self):
		self.sidewalk = Sidewalk.objects.create(address="aaa").__dict__
	
	def test_post_image_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.sidewalk["id"]) + "/image/create/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_post_image_null_sidewalk(self):
		response = self.client.post("/api/sidewalk/9999/image/create/", {'image': "abcdefgh"}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_image_no_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/image/create/", {}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_image_too_large(self):
		image = ""
		for i in range(0, 350000):
			image += "aaaaaaaaaa"
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/image/create/", {'image': image}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_image_not_string(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/image/create/", {'image': 25}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_image_cloudinary_error(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/image/create/", {'image': "aBcDefGhiKl029391212"}, format='json')
		self.assertEqual(response.status_code, 500)

	@patch("cloudinary.uploader.upload")
	def test_post_image(self, uploadMock):
		uploadMock.return_value = {'url': 'abcdefghijkl', 'public_id': 'xaIOJokko'}
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/image/create/", {'image': "aBcDefGhiKl029391212"}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertIsNotNone(SidewalkImage.objects.get(sidewalk_id=self.sidewalk["id"]))

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")

# Tests for fetching images uploaded to a sidewalk
class GetSidewalkImagesTests(APITestCase):
	def setUp(self):
		self.s1 = Sidewalk.objects.create(address="abcdefg").__dict__
		self.s2 = Sidewalk.objects.create(address="aweaweaweaweaweaweaweaweawe").__dict__
		self.s4 = Sidewalk.objects.create(address="aaa").__dict__
		
		self.i1 = SidewalkImage.objects.create(sidewalk_id=self.s1["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False).__dict__
		for i in range(0, 11):
			self.i2 = SidewalkImage.objects.create(sidewalk_id=self.s2["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending = False).__dict__

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

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")

# Tests for approving or rejecting a pending image upload
class RespondToPendingImageTests(APITestCase):
	def setUp(self):
		self.sidewalkNoImages = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalkWithImage = Sidewalk.objects.create(address="aaa").__dict__
		self.image = SidewalkImage.objects.create(sidewalk_id=self.sidewalkWithImage["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=True).__dict__
		self.approvedImage = SidewalkImage.objects.create(sidewalk_id=self.sidewalkWithImage["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False).__dict__
		self.unapprovedImage2 = SidewalkImage.objects.create(sidewalk_id=self.sidewalkWithImage["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=True).__dict__
	
	#sidewalk/id/image/respond
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_pending_image_missing_data(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithImage["id"]) + "/image/respond/", {'username': 'joe', 'password': 'kevin', 'accepted': True}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_pending_image_Invalid_credentials(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithImage["id"]) + "/image/respond/", {'username': 'u', 'password': 'p', 'accepted': True, 'imageId': self.image['id']}, format='json')
		self.assertEqual(response.status_code, 401)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_pending_image_invalid_id(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithImage["id"]) + "/image/respond/", {'username': 'joe', 'password': 'kevin', 'accepted': True, 'imageId': 999}, format='json')
		self.assertEqual(response.status_code, 404)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_pending_image_wrong_sidewalk(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkNoImages["id"]) + "/image/respond/", {'username': 'joe', 'password': 'kevin', 'accepted': True, 'imageId': self.image['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_non_pending_image(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithImage["id"]) + "/image/respond/", {'username': 'joe', 'password': 'kevin', 'accepted': False, 'imageId': self.approvedImage['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_pending_image_valid_accept(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithImage["id"]) + "/image/respond/", {'username': 'joe', 'password': 'kevin', 'accepted': True, 'imageId': self.image['id']}, format='json')
		self.assertEqual(response.status_code, 200)
		
		newImage = SidewalkImage.objects.get(pk=self.image['id'])
		self.assertFalse(newImage.is_deleted)
		self.assertFalse(newImage.is_pending)

	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_pending_image_valid_reject(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithImage["id"]) + "/image/respond/", {'username': 'joe', 'password': 'kevin', 'accepted': False, 'imageId': self.unapprovedImage2['id']}, format='json')
		self.assertEqual(response.status_code, 200)
		
		newImage = SidewalkImage.objects.get(pk=self.unapprovedImage2['id'])
		self.assertTrue(newImage.is_deleted)
		self.assertFalse(newImage.is_pending)

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")
	
# Tests for deleting an image from a sidewalk
class DeleteImageTests(APITestCase):
	def setUp(self):
		self.sidewalkNoImage = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalkWithImage = Sidewalk.objects.create(address="aaa").__dict__
		self.image = SidewalkImage.objects.create(sidewalk_id=self.sidewalkWithImage["id"], image_url="http://127.0.0.1/somewhere.jpg", is_pending=False).__dict__
	
	def test_delete_image_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.sidewalkNoImage["id"]) + "/image/delete/", format='json')
		self.assertEqual(response.status_code, 405)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_image_null_sidewalk(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/9999/image/delete/", {'username': 'u', 'password': 'p', 'imageId': self.image['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_delete_image_missing_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkNoImage["id"]) + "/image/delete/", {'username': 'u', 'password': 'p'}, format='json')
		self.assertEqual(response.status_code, 400)

	def test_delete_image_invalid_credentials(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkNoImage["id"]) + "/image/delete/", {'username': 's', 'password': 'p', 'imageId': self.image['id']}, format='json')
		self.assertEqual(response.status_code, 401)
		
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_image_invalid_image(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkNoImage["id"]) + "/image/delete/", {'username': 'u', 'password': 'p', 'imageId': -6}, format='json')
		self.assertEqual(response.status_code, 404)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_image_valid_wrong_sidewalk(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkNoImage["id"]) + "/image/delete/", {'username': 'u', 'password': 'p', 'imageId': self.image['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_image_valid(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithImage["id"]) + "/image/delete/", {'username': 'u', 'password': 'p', 'imageId': self.image['id']}, format='json')
		self.assertEqual(response.status_code, 200)
		newImage = SidewalkImage.objects.get(pk=self.image['id'])
		self.assertTrue(newImage.is_deleted)

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkimage")
			cursor.execute("DELETE FROM api_sidewalk")
