import numbers

from django.db import connection
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
import calendar
import cloudinary
import cloudinary.uploader
import cloudinary.api

from ..models import (Sidewalk, SidewalkComment, SidewalkImage, SidewalkRating)
from ..serializers import (SidewalkCommentSerializer, SidewalkImageSerializer,
                          SidewalkListSerializer, SidewalkSerializer)
from .viewUtils import LoginUtil

class SidewalkView(viewsets.ReadOnlyModelViewSet):
	queryset = Sidewalk.objects.raw("""select s.id, IFNULL(agg.accessibility, 0) as accessibility,
	 IFNULL(agg.comfort, 0) as comfort, IFNULL(agg.connectivity, 0) as connectivity, 
	 IFNULL(agg.physicalSafety, 0) as physicalSafety, IFNULL(agg.senseOfSecurity, 0) as senseOfSecurity
	 from api_sidewalk s left join (select sidewalk_id, avg(accessibility_rating) as accessibility, avg(comfort_rating) as comfort, 
	 avg(connectivity_rating) as connectivity, avg(physical_safety_rating) as physicalSafety, 
	 avg(security_rating) as senseOfSecurity from api_sidewalkrating r group by r.sidewalk_id) 
	 agg on agg.sidewalk_id = s.id""")
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
	
	## TODO: Check Why this is not returning a table
	def _getCSV(self):
		with connection.cursor as cursor:
			cursor.execute("""SELECT s.id, s.address, sc.comment_id, sc.text, sc.posted_time_comment, sc.is_deleted_comment, 
			sr.rating_id, sr.accessibility_rating, sr.connectivity_rating, sr.comfort_rating, sr.physical_safety_rating, 
			sr.security_rating, sr.is_deleted_rating, si.image_id, si.image_url, si.posted_time_image, si.is_pending, 
			si.is_deleted_image
			FROM (
				(SELECT id, address FROM api_sidewalk) as s
				FULL OUTER JOIN
				(SELECT id as comment_id, text, posted_time as posted_time_comment, is_deleted as is_deleted_comment 
				FROM api_sidewalkcomment) as sc on sc.sidewalk_id = s.id
				FULL OUTER JOIN
				(SELECT id as rating_id, accessibility_rating, connectivity_rating, comfort_rating, physical_safety_rating, 
				security_rating, is_deleted as is_deleted_rating 
				FROM api_sidewalkrating) as sr ON 
				ISNULL(s.id, sc.sidewalk_id) = sr.sidewalk_id
				FULL OUTER JOIN
				(SELECT id as image_id, image_url, posted_time as posted_time_image, is_pending, is_deleted as is_deleted_image 
				FROM api_sidewalkimage) as si ON 
				ISNULL(s.id, sc.sidewalk_id, sr.sidewalk_id) = si.sidewalk_id)""")
			rows = fetchall()
			
		return rows
		
	## Returns the total number of sidewalks, ratings and comments in sidewalk database
	## @return {list} - list of numbers with the values of total sidewalk/ratings/comments
	def _totalSidewalkRatingComment(self):
		with connection.cursor() as cursor:
			cursor.execute("""SELECT 
			(SELECT COUNT(*) FROM api_sidewalk) as sidewalk_count, 
			(SELECT COUNT(*) FROM api_sidewalkrating) as rating_count,
			(SELECT COUNT(*) FROM api_sidewalkcomment) as comment_count,
			(SELECT COUNT(*) FROM api_sidewalkimage) as image_count""")
			row = cursor.fetchall()
		return row

	## Compute the average rating of all the sidewalks and their attributes
	## @return {list} - iist contains number with the average rating of all the sidewalks
	def _avgOverallRating(self):
		with connection.cursor() as cursor:
			cursor.execute("""SELECT ((acc + con + com + ps + sec)/total) as avg
			FROM (SELECT SUM(accessibility_rating) as acc, 
			SUM(connectivity_rating) as con, 
			SUM(comfort_rating) as com, 
			SUM(physical_safety_rating) as ps, 
			SUM(security_rating) as sec, 
			COUNT(*) as total
			FROM api_sidewalkrating) as sum_indiv_rating""")
			row = cursor.fetchall()

		return row
	
	## Computes the individual rating of each feature of sidewalk for all sidewalks combined
	## @return {list} - Returns the average values of the feature of sidewalks.
	def _avgIndivRating(self):
		with connection.cursor() as cursor:
			cursor.execute("""SELECT AVG(accessibility_rating), 
			AVG(connectivity_rating), 
			AVG(comfort_rating), 
			AVG(physical_safety_rating), 
			AVG(security_rating)
			FROM api_sidewalkrating""")
			row = cursor.fetchall()

		return row

	## Calculate the total number of ratings done in a specific month and year
	## @return {list} - returns a list of contribution done in a specific month and year 
	def _contributionsByMonth(self):
		with connection.cursor() as cursor:
			cursor.execute("""SELECT month, year, COUNT(*)
			FROM (SELECT YEAR(posted_time) as year, MONTH(posted_time) as month FROM api_sidewalkrating) as dates
			GROUP BY year, month;""")
			row = cursor.fetchall()

		return row

	## formats the results computed by __contributionsByMonth function to display in summary
	## @return {list} - values of the contribution and monath and year in dicitionary format with their respective values 
	def _contributionsByMonthFormat(self, contMonth):
		dictionaryList = []
		for i in range(0, len(contMonth)):
			monthYearDictionary = {}
			value = calendar.month_name[contMonth[i][0]] + " " + str(contMonth[i][1])
			monthYearDictionary['monthYear'] = value
			monthYearDictionary['contributions'] = contMonth[0][2]
			dictionaryList.append(monthYearDictionary)
		
		return dictionaryList

	## Returns the set of all unapproved images from sidewalk database starting from a specific offset to the end of list.
	## @param {Number} startIndex - the number of rows to skip before starting to return
	## @param {Number} endIndex - the index of the last row to return
	## @return {list} - list of the unapproved images in sidewalkImage.
	def _getUnapprovedImages(self, startIndex, endIndex):
		skip = startIndex
		limit = (endIndex - skip) + 1
		qs = SidewalkImage.objects.raw("select i.id, i.image_url, i.posted_time from api_sidewalkimage i where i.is_pending = true and i.is_deleted = false order by i.posted_time DESC limit %s offset %s", [limit + 1, skip]);
		data = SidewalkImageSerializer(qs, many=True).data
		hasMoreImages = len(data) > limit
		if hasMoreImages:
			data = data[:-1]
		
		response = {
			'images': data,
			'hasMoreImages': hasMoreImages
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
		
		if not LoginUtil.checkCredentials(username, password):
			return Response(status=401)
		
		try:
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
		
		if not LoginUtil.checkCredentials(username, password):
			return Response(status=401)
		
		try:
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
	
	## Gets comment for a specific sidewalk
	## @param {Request} - the incoming HTTP POST request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=True, url_path='comment')
	def getComment(self, request, pk):
		try:
			startIndex = request.data["startIndex"]
			endIndex = request.data["endIndex"]
			if (startIndex > endIndex):
				return Response(status=400)
			elif (startIndex < 0 or endIndex < 0):
				return Response(status=400)
		except KeyError:
			return Response(status=400)

		if not Sidewalk.objects.filter(pk=pk).exists():
			return Response(status=404)

		return self._getCommentsNoRequest(pk, startIndex, endIndex)

	## Gets the unapproved Images from a specific offset towards the end of the list of images in the database ordered by date
	## @param {Request} - the incoming HTTP POST request to respond to
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=False, url_path='unapprovedImages')
	def unapprovedImages(self, request):
		try:
			username = request.data["username"]
			password = request.data["password"]
			startIndex = request.data["startIndex"]
			endIndex = request.data["endIndex"]
		except:
			return Response(status=400)
		
		if (startIndex > endIndex):
			return Response(status=400)
		elif (startIndex < 0 or endIndex < 0):
			return Response(status=400)

		if LoginUtil.checkCredentials(username, password):
			return self._getUnapprovedImages(startIndex, endIndex)
		else:
			return Response(status=401)

	## Approve or rejects an image uploaded by the user
	## @param {Request} - the incoming HTTP POST request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=True, url_path='image/respond')
	def pendingImage(self, request, pk):
		try:
			username = request.data["username"]
			password = request.data["password"]
			accepted = request.data["accepted"]
			imageId = request.data["imageId"]
		except:
			return Response(status=400)

		if LoginUtil.checkCredentials(username, password):
			try:
				approveImage = SidewalkImage.objects.get(id=imageId, sidewalk_id=pk, is_pending=True)
			except SidewalkImage.DoesNotExist:
				return Response(status=404)

			approveImage.is_pending = False
			if not accepted:
				approveImage.is_deleted = True
			approveImage.save()
			return Response(status=200)
		else:
			return Response(status=401)

	## Gets the summary for all the sidewalks present in the database
	## @param {Request} - the incoming HTTP POST request to respond to
	## @return {Response} - the response to the post request
	@action(methods=['get'], detail=False, url_path='summary')
	def sidewalkSummary(self, request):
		count_values = self._totalSidewalkRatingComment()
		contMonth = self._contributionsByMonth()

		response = {
			"totalSidewalks": count_values[0][0],
			"totalRatings": count_values[0][1],
			"totalComments": count_values[0][2],
			"totalImagesUploaded": count_values[0][3],
			"averageOverallRating": self._avgOverallRating()[0][0],
			"contributionsByMonth": self._contributionsByMonthFormat(contMonth),

			"averageRatings": {
				"accessibility": self._avgIndivRating()[0][0],
				"connectivity": self._avgIndivRating()[0][1],
				"comfort": self._avgIndivRating()[0][2],
				"physical safety": self._avgIndivRating()[0][3],
				"security": self._avgIndivRating()[0][4]
			}

		}
		return Response(response)

	
	## Gets the CSV data of the sidewalk database.
	## @param {Request} - the incoming HTTP POST request to respond to
	## @return {Response} - the response to the post request
	@action(methods=['post'], detail=False, url_path='completeCSV')
	def completeCSV(self, request):
		try:
			username = request.data["username"]
			password = request.data["password"]
		except:
			return Response(status=400)

		## TODO: Check why __getCSV method being called does not return a table	
		# csvData = self.__getCSV

		# response = { 
		# 	"summary": str(csvData)
		# }
		response = 2
		return Response(response)

	# TODO: Need to get the longitude and latitude from ArcGIS after Implementation
	@action(methods=['get'], detail=True, url_path='addressLocation')
	def latLonImage(self, request, pk):
		try:
			address = request.data["address"]
		except KeyError:
			return Response(status=400)

		query = Sidewalk.objects.raw("SELECT id FROM sidewalk WHERE address = %s", [address])
		data_val = SidewalkSerializer(query, many=True).data
		response = {
			'latitude': data_val,
			'longitude': data_val
		}
		response = 2
		return Response(response)
