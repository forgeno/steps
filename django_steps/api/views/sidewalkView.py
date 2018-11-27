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
	queryset = SidewalkRating.objects.raw("""select s.id, IFNULL(agg.accessibility, 0) as accessibility,
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
		# TODO: write unit tests when this is implemented (can't be done until pedestrian data is in correct format)
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
	
	## Gets a complete summary of all sidewalks
	## @return {Object} - a complete summary of all sidewalks
	def _getAllSidewalksSummary(self):
		with connection.cursor() as cursor:
			cursor.execute("""select id as sid
			 from api_sidewalk""")
			sidewalks = cursor.fetchall()
		
			cursor.execute("""select IFNULL(avg(accessibility_rating), 0) as accessibility,
			 IFNULL(avg(comfort_rating), 0) as comfort, IFNULL(avg(connectivity_rating), 0) as connectivity, 
			 IFNULL(avg(physical_safety_rating), 0) as physicalSafety, IFNULL(avg(security_rating), 0) as senseOfSecurity,
			 COUNT(*) as totalRatings, sidewalk_id as sid
			 from api_sidewalkrating
			 group by sidewalk_id""")
			ratings = cursor.fetchall()
			
			cursor.execute("""select COUNT(*) as totalComments, sidewalk_id as sid
			 from api_sidewalkcomment
			 where is_deleted = false
			 group by sidewalk_id""")
			comments = cursor.fetchall()

			cursor.execute("""select COUNT(*) as totalImages, sidewalk_id as sid
			 from api_sidewalkimage
			 where is_deleted = false and is_pending = false
			 group by sidewalk_id""")
			images = cursor.fetchall()
		
		allSidewalksData = []
		for sidewalk in sidewalks:
			sidewalkData = {"id": sidewalk[0]}
			for rating in ratings:
				if rating[6] == sidewalk[0]:
					sidewalkData["accessibility"] = rating[0]
					sidewalkData["comfort"] = rating[1]
					sidewalkData["connectivity"] = rating[2]
					sidewalkData["physicalSafety"] = rating[3]
					sidewalkData["senseOfSecurity"] = rating[4]
					sidewalkData["ratings"] = rating[5]
					sidewalkData['overallRating'] = (rating[0] + rating[1] + rating[2] + rating[3] + rating[4]) / 5
					break
			if "accessibility" not in sidewalkData:
				sidewalkData["accessibility"] = 0
				sidewalkData["comfort"] = 0
				sidewalkData["connectivity"] = 0
				sidewalkData["physicalSafety"] = 0
				sidewalkData["senseOfSecurity"] = 0
				sidewalkData["ratings"] = 0
				sidewalkData['overallRating'] = 0
			
			for comment in comments:
				if comment[1] == sidewalk[0]:
					sidewalkData["comments"] = comment[0]
					break
			if "comments" not in sidewalkData:
				sidewalkData["comments"] = 0
			
			for image in images:
				if image[1] == sidewalk[0]:
					sidewalkData["images"] = image[0]
					break
			if "images" not in sidewalkData:
				sidewalkData["images"] = 0
			allSidewalksData.append(sidewalkData)
		
		return {"sidewalks": allSidewalksData}
		
	## Returns the total number of sidewalks, ratings and comments in sidewalk database
	## @return {list} - a list of counts in the form of [sidewalk count, rating count, comment count, image count]
	def _getTotalCounts(self):
		with connection.cursor() as cursor:
			cursor.execute("""SELECT 
			(SELECT COUNT(*) FROM api_sidewalk) as sidewalk_count, 
			(SELECT COUNT(*) FROM api_sidewalkrating) as rating_count,
			(SELECT COUNT(*) FROM api_sidewalkcomment) as comment_count,
			(SELECT COUNT(*) FROM api_sidewalkimage) as image_count""")
			row = cursor.fetchall()
		return row[0]

	## Computes the individual rating of each feature of sidewalk for all sidewalks combined
	## @return {list} - the average values of each walkability attribute across all sidewalks in the order
	## 			[accessibility, connectivity, comfort, physical safety, security]
	def _avgIndivRating(self):
		with connection.cursor() as cursor:
			cursor.execute("""SELECT TRUNCATE(IFNULL(AVG(accessibility_rating), 0), 2), 
			TRUNCATE(IFNULL(AVG(connectivity_rating), 0), 2), 
			TRUNCATE(IFNULL(AVG(comfort_rating), 0), 2), 
			TRUNCATE(IFNULL(AVG(physical_safety_rating), 0), 2), 
			TRUNCATE(IFNULL(AVG(security_rating), 0), 2)
			FROM api_sidewalkrating""")
			row = cursor.fetchone()

		return row

	## Computes the average rating of all the sidewalks and their attributes
	## @return {number} - the average overall rating across all sidewalks
	def _avgOverallRating(self):
		indiv = self._avgIndivRating()
		return round((indiv[0] + indiv[1] + indiv[2] + indiv[3] + indiv[4]) / 5, 2)
	
	## Calculate the total number of contributions made in a specific month and year
	## @return {list} - returns a list of contribution made by specific month and year in the form [(month + year, contribution count), ...]
	def _contributionsByMonth(self):
		with connection.cursor() as cursor:
			cursor.execute("""SELECT month, year, COUNT(*)
			FROM (SELECT YEAR(posted_time) as year, MONTH(posted_time) as month FROM api_sidewalkrating) ratings
			GROUP BY year, month;""")
			ratings = cursor.fetchall()
			
			cursor.execute("""SELECT month, year, COUNT(*)
			FROM (SELECT YEAR(posted_time) as year, MONTH(posted_time) as month FROM api_sidewalkcomment) comments
			GROUP BY year, month;""")
			comments = cursor.fetchall()
			
			cursor.execute("""SELECT month, year, COUNT(*)
			FROM (SELECT YEAR(posted_time) as year, MONTH(posted_time) as month FROM api_sidewalkimage) images
			GROUP BY year, month;""")
			images = cursor.fetchall()

		joined = {}
		for type in (ratings, comments, images):
			for dateInstance in type:
				date = str(dateInstance[0]) + "/" + str(dateInstance[1])
				if date in joined:
					joined[date] += dateInstance[2]
				else:
					joined[date] = dateInstance[2]
		return joined.items()

	## formats the results computed by __contributionsByMonth function to display in summary
	## @return {list} - values of the contribution and month and year in dicitionary format with their respective values 
	def _getFormattedContributions(self):
		contMonth = self._contributionsByMonth()
		contributions = []
		for contrib in contMonth:
			contributions.append({
				"monthYear": contrib[0],
				"contributions": contrib[1]
			})
		return contributions

	## Returns the set of all unapproved images from sidewalk database starting from a specific offset to the end of list.
	## @param {Number} startIndex - the number of rows to skip before starting to return
	## @param {Number} endIndex - the index of the last row to return
	## @return {list} - list of the unapproved images in sidewalkImage.
	def _getUnapprovedImages(self, startIndex, endIndex):
		skip = startIndex
		limit = (endIndex - skip) + 1
		qs = SidewalkImage.objects.raw("select i.id, i.image_url, i.posted_time, i.sidewalk_id from api_sidewalkimage i where i.is_pending = true and i.is_deleted = false order by i.posted_time DESC limit %s offset %s", [limit + 1, skip]);
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
		
	## Handles an incoming request to get details about ratings posted to a sidewalk
	## @param {Request} - the incoming HTTP GET request to respond to
	## @param {String} pk - the ID of the sidewalk
	## @return {Response} - the response to the get request
	@action(methods=['get'], detail=True, url_path='ratings')
	def getRatings(self, request, pk):
		if not Sidewalk.objects.filter(pk=pk).exists():
			return Response(status=404)
		
		with connection.cursor() as cursor:
			cursor.execute("""select IFNULL(avg(accessibility_rating), 0) as accessibility,
			 IFNULL(avg(comfort_rating), 0) as comfort, IFNULL(avg(connectivity_rating), 0) as connectivity, 
			 IFNULL(avg(physical_safety_rating), 0) as physicalSafety, IFNULL(avg(security_rating), 0) as senseOfSecurity,
			 COUNT(*) as totalRatings
			 from api_sidewalkrating
			 where sidewalk_id=%s
			 group by sidewalk_id""", [pk])
			sidewalk = cursor.fetchone()
		if not sidewalk:
			sidewalk = [0, 0, 0, 0, 0, 0]

		data = {
			'accessibility': sidewalk[0],
			'comfort': sidewalk[1],
			'connectivity': sidewalk[2],
			'physicalSafety': sidewalk[3],
			'senseOfSecurity': sidewalk[4],
			'totalRatings': sidewalk[5],
			'overallRating': (sidewalk[0] + sidewalk[1] + sidewalk[2] + sidewalk[3] + sidewalk[4]) / 5
		}
		return Response(data)

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
		qs = SidewalkRating.objects.raw("""select s.id, s.address, IFNULL(agg.accessibility, 0) as accessibility,
		 IFNULL(agg.comfort, 0) as comfort, IFNULL(agg.connectivity, 0) as connectivity, 
		 IFNULL(agg.physicalSafety, 0) as physicalSafety, IFNULL(agg.senseOfSecurity, 0) as senseOfSecurity
		 from api_sidewalk s left join (select sidewalk_id, avg(accessibility_rating) as accessibility, avg(comfort_rating) as comfort, 
		 avg(connectivity_rating) as connectivity, avg(physical_safety_rating) as physicalSafety, 
		 avg(security_rating) as senseOfSecurity from api_sidewalkrating r group by r.sidewalk_id) 
		 agg on agg.sidewalk_id = s.id""")
		result = SidewalkListSerializer(qs, many=True).data

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
		count_values = self._getTotalCounts()
		avgRatings = self._avgIndivRating()

		response = {
			"totalSidewalks": count_values[0],
			"totalRatings": count_values[1],
			"totalComments": count_values[2],
			"totalImagesUploaded": count_values[3],
			"averageOverallRating": self._avgOverallRating(),
			"contributionsByMonth": self._getFormattedContributions(),

			"averageRatings": {
				"accessibility": avgRatings[0],
				"connectivity": avgRatings[1],
				"comfort": avgRatings[2],
				"physical safety": avgRatings[3],
				"security": avgRatings[4]
			}

		}
		return Response(response)

	
	## Gets the CSV data of the sidewalk database.
	## @param {Request} - the incoming HTTP POST request to respond to
	## @return {Response} - the response to the post request
	@action(methods=['get'], detail=False, url_path='completeSummary')
	def completeSummary(self, request):
		return Response(self._getAllSidewalksSummary())
