from rest_framework.test import APITestCase
from rest_framework import status
from django.utils.dateparse import parse_datetime
from django.db import connection

from unittest.mock import patch

from api.models import Sidewalk, SidewalkComment
import api.views.viewUtils

# Tests for fetching all comments on a sidewalk
class GetSidewalkCommentsTests(APITestCase):
	def setUp(self):
		self.sidewalk = Sidewalk.objects.create(address="aaa").__dict__
		self.sidewalkMoreComments = Sidewalk.objects.create(address="aaa").__dict__
		self.comment = SidewalkComment.objects.create(sidewalk_id=self.sidewalk["id"], text="2anything").__dict__
		for i in range(0, 20):
			SidewalkComment.objects.create(sidewalk_id=self.sidewalkMoreComments["id"], text=str(i)).__dict__
	
	#sidewalk/id/comment Tests
	def test_get_sidewalk_comment_end_before_start(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/", {'startIndex': 10, 'endIndex': 3}, format='json')
		self.assertEqual(response.status_code, 400)

	def test_get_sidewalk_comment_end_before_start(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/", {'startIndex': 10, 'endIndex': 3}, format='json')
		self.assertEqual(response.status_code, 400)

	def test_get_sidewalk_comment_negative_end(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/", {'startIndex': -5, 'endIndex': -3}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_get_sidewalk_comment_missing_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/", {'startIndex': 0}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_get_sidewalk_comment_valid(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/", {'startIndex': 0, 'endIndex': 0}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data['comments']), 1)
		self.assertFalse(response.data['hasMoreComments'])
		self.assertEqual(response.data['comments'][0]['text'], "2anything")
	
	def test_get_sidewalk_comment_valid_no_results(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/", {'startIndex': 10, 'endIndex': 30}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data['comments']), 0)
		self.assertFalse(response.data['hasMoreComments'])
		
	def test_get_sidewalk_comment_valid_less_than_end(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/", {'startIndex': 0, 'endIndex': 10}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data['comments']), 1)
		self.assertFalse(response.data['hasMoreComments'])
		self.assertEqual(response.data['comments'][0]['text'], "2anything")
	
	def test_get_sidewalk_comment_valid_more_results(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkMoreComments["id"]) + "/comment/", {'startIndex': 0, 'endIndex': 5}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data['comments']), 6)
		self.assertTrue(response.data['hasMoreComments'])
		
		# validate ordering of comments to make sure most recent ones are first
		currentIndex = 19
		for comment in list(response.data["comments"]):
			i = int(comment["text"])
			self.assertEqual(currentIndex, i)
			currentIndex -= 1
		
		# make sure the loop was actually iterated through
		self.assertTrue(currentIndex < 99)
	
# Tests for deleting sidewalk comments
class DeleteSidewalkCommentTests(APITestCase):
	def setUp(self):
		self.sidewalkNoComments =  Sidewalk.objects.create(address="abcdefg").__dict__
		self.sidewalkWithComments = Sidewalk.objects.create(address="abcdefg").__dict__
		self.comment = SidewalkComment.objects.create(sidewalk_id=self.sidewalkWithComments["id"], text="abcdefghij").__dict__
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_comment_with_get(self, loginMock):
		loginMock.return_value = True
		response = self.client.get("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", format='json')
		self.assertEqual(response.status_code, 405)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_comment_null_sidewalk(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/9999/comment/delete/", {'username': 'u', 'password': 'p', 'id': self.comment['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	def test_delete_comment_missing_data(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", {'username': 'u', 'password': 'p'}, format='json')
		self.assertEqual(response.status_code, 400)

	def test_delete_comment_invalid_credentials(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", {'username': 's', 'password': 'p', 'id': self.comment['id']}, format='json')
		self.assertEqual(response.status_code, 401)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_comment_invalid_comment(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", {'username': 'u', 'password': 'p', 'id': -6}, format='json')
		self.assertEqual(response.status_code, 404)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_comment_valid_wrong_sidewalk(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkNoComments["id"]) + "/comment/delete/", {'username': 'u', 'password': 'p', 'id': self.comment['id']}, format='json')
		self.assertEqual(response.status_code, 404)
	
	@patch("api.views.viewUtils.LoginUtil.checkCredentials")
	def test_delete_comment_valid(self, loginMock):
		loginMock.return_value = True
		response = self.client.post("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/comment/delete/", {'username': 'u', 'password': 'p', 'id': self.comment['id']}, format='json')
		self.assertEqual(response.status_code, 200)
		
		self.assertTrue(SidewalkComment.objects.get(pk=self.comment['id']).is_deleted)
		response2 = self.client.get("/api/sidewalk/" + str(self.sidewalkWithComments["id"]) + "/", format='json')
		self.assertEqual(response2.data["totalComments"], 0)

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkcomment")
			cursor.execute("DELETE FROM api_sidewalk")

# Tests for posting a comment to a sidewalk
class PostCommentTests(APITestCase):
	def setUp(self):
		self.sidewalk = Sidewalk.objects.create(address="aaa").__dict__
		
	def test_post_comment_with_get(self):
		response = self.client.get("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/create/", format='json')
		self.assertEqual(response.status_code, 405)
	
	def test_post_comment_null_sidewalk(self):
		response = self.client.post("/api/sidewalk/9999/comment/create/", {'text': "abcdefgh"}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_comment_numeric_text(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/create/", {'text': 25}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_comment_no_text(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/create/", {}, format='json')
		self.assertEqual(response.status_code, 400)
	
	def test_post_comment_too_long(self):
		text = ""
		for i in range(0, 100):
			text += "aaaaaaaaaaaaaaaaaaaa"
		
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/create/", {'text': text}, format='json')
		self.assertEqual(response.status_code, 400)
	
	# TODO: make this
	#def test_post_comment_inappropriate(self):
	#	text = ""
	#	response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/create/", {'text': text}, format='json')
	#	self.assertEqual(response.status_code, 400)
	
	# TODO: make this
	#def test_post_comment_personal_info(self):
	#	text = ""
	#	response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/create/", {'text': text}, format='json')
	#	self.assertEqual(response.status_code, 400)
	
	def test_post_comment(self):
		response = self.client.post("/api/sidewalk/" + str(self.sidewalk["id"]) + "/comment/create/", {'text': "a test comment"}, format='json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["text"], "a test comment")
		
		newComment = SidewalkComment.objects.get(pk=response.data["id"])
		self.assertEqual(newComment.sidewalk_id, self.sidewalk["id"])
		self.assertEqual(newComment.text, "a test comment")

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_sidewalkcomment")
			cursor.execute("DELETE FROM api_sidewalk")
