from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import (AdminAccount)
from ..serializers import (AdminAccountSerializer)
from .viewUtils import LoginUtil

class AdminAccountView(viewsets.ReadOnlyModelViewSet):
	queryset = AdminAccount.objects.raw('SELECT * FROM api_adminaccount');
	serializer_class = AdminAccountSerializer
	allowed_methods = ['POST']
	http_method_names = ['post']

	## Check if the credentials entered by the user is valid.
	## @param {Request} - the incoming HTTP POST request to respond to
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=False, url_path='login')
	def validLogin(self, request):
		try:
			username = request.data["username"]
			password = request.data["password"]
		except:
			return Response(status=400)

		response = {
			"valid": LoginUtil.checkCredentials(username, password)
		}
		if response["valid"]:
			return Response(response)
		else:
			return Response(response, status=401)