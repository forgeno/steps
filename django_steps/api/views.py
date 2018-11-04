from django.db import connection
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Sidewalk, SidewalkRating, Pedestrian, SidewalkComment, SidewalkImage, AdminAccount
from .serializers import SidewalkSerializer, SidewalkListSerializer, PedestrianSerializer, SidewalkImageSerializer, AdminAccountSerializer, SidewalkCommentSerializer

import cloudinary
import cloudinary.uploader
import cloudinary.api

import numbers

class SidewalkView(viewsets.ReadOnlyModelViewSet):
	queryset = Sidewalk.objects.raw("select s.id, IFNULL(agg.accessibility, 0) as accessibility, IFNULL(agg.comfort, 0) as comfort, IFNULL(agg.connectivity, 0) as connectivity, IFNULL(agg.physicalSafety, 0) as physicalSafety, IFNULL(agg.senseOfSecurity, 0) as senseOfSecurity from api_sidewalk s left join (select sidewalk_id, avg(accessibility_rating) as accessibility, avg(comfort_rating) as comfort, avg(connectivity_rating) as connectivity, avg(physical_safety_rating) as physicalSafety, avg(security_rating) as senseOfSecurity from api_sidewalkrating r group by r.sidewalk_id) agg on agg.sidewalk_id = s.id");
	serializer_class = SidewalkListSerializer
	allowed_methods = ['GET', 'POST']
	http_method_names = ['get', 'post']
	
	## Gets a paginated list of images for a sidewalk
	## @param {String} pk - the ID of the sidewalk
	## @param {Number} startIndex - the number of rows to skip before starting to return
	## @param {Number} endIndex - the index of the last row to return
	## @param {boolean} getImageCount - whether to include the total number of images for this sidewalk
	## @return {Response} - a response with a list of images, whether there is more images to fetch, and optionally the total number of images
	def _getImagesNoRequest(self, pk, startIndex, endIndex, getImageCount=False):
		skip = startIndex
		limit = (endIndex - skip) + 1
		qs = SidewalkImage.objects.raw("select i.id, i.image_url, i.posted_time from api_sidewalkimage i where i.is_pending = false and i.is_deleted = false and i.sidewalk_id = %s order by i.posted_time DESC limit %s offset %s", [pk, limit + 1, skip]);
		data = SidewalkImageSerializer(qs, many=True).data
		hasMoreImages = len(data) > limit
		if hasMoreImages:
			data = data[:-1]
		
		response = {
			'images': data,
			'hasMoreImages': hasMoreImages
		}
		if getImageCount:
			imageCount = SidewalkImage.objects.raw("select 1 as id, COUNT(*) as imageCount from api_sidewalkimage i where i.is_pending = false and i.is_deleted = false and i.sidewalk_id = " + pk)[0]
			response['imageCount'] = imageCount.__dict__['imageCount'];
		return Response(response);
	
	## Gets the total number of ratings for the specified sidewalk
	## @param {String} pk - the ID of the sidewalk
	## @return {Number} - the total number of ratings for the specified sidewalk
	def _getRatingsCount(self, pk):
		with connection.cursor() as cursor:
			cursor.execute("SELECT COUNT(*) FROM api_sidewalkrating WHERE sidewalk_id = %s", [pk])
			row = cursor.fetchone()
		return row[0]
	
	## Gets the total number of comments for the specified sidewalk
	## @param {String} pk - the ID of the sidewalk
	## @return {Number} - the total number of comments for the specified sidewalk
	def _getCommentsCount(self, pk):
		with connection.cursor() as cursor:
			cursor.execute("SELECT COUNT(*) FROM api_sidewalkcomment WHERE sidewalk_id = %s AND is_deleted = False", [pk])
			row = cursor.fetchone()
		return row[0]
	
	## Gets the distribution of different mobility activity types for the specified sidewalk
	## @param {String} pk - the ID of the sidewalk
	## @return {List<Object>} - a list consisting of each activity, and the relative occurrences each activity represents as a percentage (0 to 1)
	def _getMobilityTypeDistribution(self, pk):
		# TODO: limit to just the given sidewalk with primary key
		with connection.cursor() as cursor:
			cursor.execute("SELECT activity_title as activityTitle, COUNT(*) FROM api_pedestrian GROUP BY activity_title")
			rows = cursor.fetchall()
		total = 0
		for row in rows:
			total += row[1]
		for row in rows:
			row[1] = row[1] / total
		return rows
	
	## Gets a paginated list of comments for a sidewalk
	## @param {String} pk - the ID of the sidewalk
	## @param {Number} startIndex - the number of rows to skip before starting to return
	## @param {Number} endIndex - the index of the last row to return
	## @return {Response} - a response with a list of comments, and whether there is more comments to fetch
	def _getCommentsNoRequest(self, pk, startIndex, endIndex):
		skip = startIndex
		limit = (endIndex - skip) + 1
		qs = SidewalkComment.objects.raw("SELECT id, text, posted_time FROM api_sidewalkcomment where is_deleted = false and sidewalk_id = %s order by posted_time DESC limit %s offset %s", [pk, limit + 1, skip]);
		data = SidewalkCommentSerializer(qs, many=True).data
		hasMoreComments = len(data) > limit
		if hasMoreComments:
			data = data[:-1]
		
		response = {
			'comments': data,
			'hasMoreComments': hasMoreComments
		}
		return Response(response);
	
	## Gets a paginated list of images for a sidewalk
	## @param {Request} request - the incoming HTTP POST request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - a response with a list of images, whether there is more images to fetch
	@action(methods=['post'], detail=True, url_path='image')
	def getImages(self, request, pk):
		try:
			startIndex = request.data["startIndex"]
			endIndex = request.data["endIndex"]
			if (startIndex > endIndex):
				return Response(status=400)
			elif (startIndex < 0 or endIndex < 0):
				return Response(status=400)
		except KeyError:
			return Response(status=400)
			
		return self._getImagesNoRequest(pk, startIndex, endIndex)

	## Handles an incoming request to post a comment to a sidewalk
	## @param {Request} - the incoming HTTP POST request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - a response describing the comment if it was created, or the error if invalid
	@action(methods=['post'], detail=True, url_path='comment/create')
	def postComment(self, request, pk):
		try:
			text = request.data["text"]
		except KeyError:
			return Response(status=400)
		
		# TODO: prevent comments with certain content
		if ((type(text) is not str) or len(text) > 300):
			return Response(status=400)
			
		if not Sidewalk.objects.filter(pk=pk).exists():
			return Response(status=400)
		
		comment = SidewalkComment.objects.create(sidewalk_id=pk, text=text).__dict__;
		return Response(data = {'text': comment['text'], 'id': comment['id'], 'date': comment['posted_time']})

	## Handles an incoming request to post an image to a sidewalk
	## @param {Request} - the incoming HTTP POST request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=True, url_path='image/create')
	def postImage(self, request, pk):
		try:
			image = request.data["image"]
		except KeyError:
			return Response(status=400)
		
		if ((type(image) is not str) or len(image) > 3145728):
			return Response(status=400)
		
		if not Sidewalk.objects.filter(pk=pk).exists():
			return Response(status=400)
		
		try:
			result = cloudinary.uploader.upload(image)
			SidewalkImage.objects.create(sidewalk_id=pk, image_url=result["url"], uploaded_id=result["public_id"])
			return Response(status=200)
		except:
			return Response(status=500)

	## Handles an incoming request to post a rating to a sidewalk
	## @param {Request} - the incoming HTTP POST request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=True, url_path='rate')
	def submitRating(self, request, pk):
		try:
			accessibility = request.data["accessibility"]
			comfort = request.data["comfort"]
			connectivity = request.data["connectivity"]
			physicalSafety = request.data["physicalSafety"]
			security = request.data["senseOfSecurity"]
		except KeyError:
			return Response(status=400)
		
		ratings = (accessibility, comfort, connectivity, physicalSafety, security)
		for rating in ratings:
			if ((not isinstance(rating, numbers.Number)) or rating > 5 or rating < 0):
				return Response(status=400)
		
		if not Sidewalk.objects.filter(pk=pk).exists():
			return Response(status=400)
		
		SidewalkRating.objects.create(sidewalk_id=pk, accessibility_rating=accessibility, comfort_rating=comfort,
			connectivity_rating=connectivity, physical_safety_rating=physicalSafety, security_rating=security);
		return Response(status=200)
		
	## Handles an incoming request to delete an image
	## @param {Request} - the incoming HTTP POST request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=True, url_path='image/delete')
	def deleteImage(self, request, pk):
		try:
			username = request.data["username"]
			password = request.data["password"]
			imageId = request.data["imageId"]
		except:
			return Response(status=400)
		
		# TODO: if invalid credentials
		if False:
			return Response(status=401)
		
		try:
			# TODO: verify that this actually works
			image = SidewalkImage.objects.get(pk=imageId,sidewalk_id=pk)
			image.is_deleted = True
			image.save()
		except SidewalkImage.DoesNotExist:
			return Response(status=404)
		
		return Response(status=200)
	
	## Handles an incoming request to delete a comment
	## @param {Request} - the incoming HTTP POST request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=True, url_path='comment/delete')
	def deleteComment(self, request, pk):
		try:
			username = request.data["username"]
			password = request.data["password"]
			commentId = request.data["id"]
		except:
			return Response(status=400)
		
		# TODO: if invalid credentials
		if False:
			return Response(status=401)
		
		try:
			# TODO: verify that this actually works
			image = SidewalkComment.objects.get(pk=commentId,sidewalk_id=pk)
			image.is_deleted = True
			image.save()
		except SidewalkComment.DoesNotExist:
			return Response(status=404)
		
		return Response(status=200)
	
	## Gets a very basic summary of all sidewalks
	## @param {Request} request - the HTTP GET request to service
	## @return {Response} - a list of all sidewalks and their average ratings
	def list(self, request):
		result = self.serializer_class(self.queryset, many=True).data
		for sidewalk in result:
			sidewalk['overallRating'] = (sidewalk['accessibility'] + sidewalk['connectivity'] + sidewalk['comfort'] + sidewalk['physicalSafety'] + sidewalk['senseOfSecurity']) / 5
		return Response(result)

	## Gets a detailed overview about a specific sidewalk
	## @param {Request} request - the HTTP GET request to service
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - a response with details about the sidewalk
	def retrieve(self, request, pk):
		# TODO: average velocity --> the field in the database is a string and not a number
		try:
			sidewalk = Sidewalk.objects.get(pk=pk)
		except Sidewalk.DoesNotExist:
			return Response(status=404)
		
		imageData = self._getImagesNoRequest(pk, 0, 0, True).data
		if len(imageData['images']) > 0:
			lastImage = imageData['images'][len(imageData['images']) - 1]
		else:
			lastImage = None
		totalImages = imageData['imageCount']
		ssd = SidewalkSerializer(sidewalk).data
		response = {
			'id': ssd['id'],
			'comments': self._getCommentsNoRequest(pk, 0, 24).data["comments"],
			'lastImage': lastImage,
			'totalImages': totalImages,
			'totalComments': self._getCommentsCount(pk),
			'totalRatings': self._getRatingsCount(pk),
			'averageVelocity': 0,
			'mobilityTypeDistribution': self._getMobilityTypeDistribution(pk),
			'address': ssd['address']
		}
		return Response(response)

class PedestrianView(viewsets.ModelViewSet):
	queryset = Pedestrian.objects.all()
	serializer_class = PedestrianSerializer
	allowed_methods = ['GET']
	http_method_names = ['get']

class AdminAccountView(viewsets.ModelViewSet):
	queryset = AdminAccount.objects.all()
	serializer_class = AdminAccountSerializer
	allowed_methods = ['GET']
	http_method_names = ['get']
