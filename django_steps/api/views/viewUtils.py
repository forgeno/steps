from django.db import connection

class LoginUtil():
	## Checks the credentials entered by user to determine if it is a valid admin login or not
	## @param {String} username - username of the admin
	## @param {String} password - password of the admin
	## @return {Number} - return 1 if the admin is valid
	@staticmethod
	def checkCredentials(username, password):
		with connection.cursor() as cursor:
			cursor.execute("""SELECT COUNT(*) 
			FROM api_adminaccount 
			WHERE username = %s 
			AND password = %s""", [username, password])
			row = cursor.fetchone()
		return row[0]