from rest_framework.test import APITestCase
from django.db import connection

from unittest.mock import patch

from api.models import AdminAccount

class AdminTests(APITestCase):	
	def setUp(self):
		AdminAccount.objects.create(username = "joe", password = "kevin")
	
	def test_valid_login_invalid(self):
		response = self.client.post("/api/adminAccount/login/", {'username': 'u', 'password': 'p'}, format='json')
		self.assertEqual(response.status_code, 401)
	
	def test_valid_login(self):
		response = self.client.post("/api/adminAccount/login/", {'username': 'joe', 'password': 'kevin'}, format='json')
		self.assertEqual(response.status_code, 200)

	def tearDown(self):
		with connection.cursor() as cursor:
			cursor.execute("DELETE FROM api_adminaccount")
