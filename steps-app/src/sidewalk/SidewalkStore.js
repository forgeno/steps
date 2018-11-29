import Reflux from "reflux";

import Actions from "./SidewalkActions";
import RestUtil from "../util/RestUtil";

/**
 * This store keeps track of the state of components that deal with sidewalks
 */
export default class SidewalkStore extends Reflux.Store {

	constructor() {
		super();
		this.state = this._getDefaultSidewalkState();
		this.listenables = Actions;

		if (process.env.NODE_ENV === "development"){
			window.DEV_SIDEWALK_STORE = this;
		}
	}

	/**
	 * Gets the default state of the store before a sidewalk is selected
	 * @return {Object} - the default state of the store before a sidewalk is selected
	 */
	_getDefaultSidewalkState() {
		return {
			loadedUserImages: [],
			hasNextImagesPage: true,
			currentSidewalk: null,
			uploadingSidewalkImage: false,
			uploadedImageError: false,
			uploadingComment: false,
			uploadCommentFailed: false,
			uploadImageSucceeded: false,
			ratingStatus: true,
			sameSidewalkRatingError: false,
			thirtySecondRatingError: false,
			hasNextCommentsPage: true,
			sidewalkHasCSVData: false,
			commentOneSidewalk: false,
			thirtyCommentSuspend: false,
			isNextImagePageLoading: false

		};
	}

	/**
	 * Loads data about the specified sidewalk
	 * @param {Object} sidewalk - a basic summary of the sidewalk to load, including it's id and average ratings
	 */
	onLoadSidewalkDetails(sidewalk) {
		this.setState(this._getDefaultSidewalkState());
		RestUtil.sendGetRequest(`sidewalk/${sidewalk.id}`).then((data) => {
			const newSidewalk = Object.assign({}, sidewalk, data),
				hasNextCommentsPage = newSidewalk.comments.length === 25;
			console.log(sidewalk, data," save me");
			this.setState({
				currentSidewalk: newSidewalk,
				hasNextImagesPage: newSidewalk.lastImage,
				loadedUserImages: [newSidewalk.lastImage],
				hasNextCommentsPage: hasNextCommentsPage,
				address: sidewalk.address
			});
		}).catch((err) => {
			console.error(err);
		});
	}

	/**
	 * Handles the user selecting an image to upload to a sidewalk
	 * @param {String} base64Image - the image as a base64 string
	 */
	onUploadSidewalkImage(base64Image) {
		this.setState({
			uploadingSidewalkImage: true,
			uploadedImageError: false,
			uploadImageSucceeded: false
		});

		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/image/create`, {
			image: base64Image
		}).then(() => {
			this.setState({
				uploadingSidewalkImage: false,
				uploadImageSucceeded: true
			});
		}).catch((err) => {
			this.setState({
				uploadingSidewalkImage: false,
				uploadedImageError: true
			});
			console.error(err);
		});
	}

	/**
	 * Loads user uploaded images from the database
	 * @param {number} startIndex - the amount of images to skip before starting to return them
	 * @param {number} stopIndex - the index of the last item to load
	 */
	onLoadUploadedImages(startIndex, stopIndex, updateStateCallback) {
		this.setState({
			isNextImagePageLoading: true
		});
		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/image`, {
			startIndex: startIndex,
			endIndex: stopIndex
		}).then((res) => {
			this.setState({
				hasNextImagesPage: res.hasMoreImages,
				loadedUserImages: this.state.loadedUserImages.slice(0).concat(res.images),
				isNextImagePageLoading: false
			});
		}).catch((err) => {
			this.setState({
				isNextImagePageLoading: false
			});
			console.error(err);
		});
	}

	/**
	 * Uploads a comment to the database for the current sidewalk
	 * @param {String} comment - the comment to upload
	 */
	onUploadComment(comment) {
		this.setState({
			uploadingComment: true,
			uploadCommentSucceeded: false,
			uploadCommentFailed: false
		});
		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/comment/create`, {
			text: comment
		}).then((res) => {
			const currentSidewalkComments = this.state.currentSidewalk.comments.slice();
			currentSidewalkComments.unshift(res);
			this.setState({
				uploadingComment: false,
				uploadCommentSucceeded: true,
				currentSidewalk: Object.assign(this.state.currentSidewalk, { comments: currentSidewalkComments })
			});
		}).catch((err) => {
			this.setState({
				uploadingComment: false,
				uploadCommentFailed: true
			});
			console.error(err);
		});
	}
	/**
	 * Displays the message notifying users they can't post more than 3 comments for one sidewalk in a day
	 */
	onSuspendedSidewalkComment() {
		this.setState({
			commentOneSidewalk: true
		});
	}

	/**
	 * Dismisses the message notifying users they can't post more than 3 comments for one sidewalk in a day
	 */
	onDismissSuspendSidewalkComment() {
		this.setState({
			commentOneSidewalk: false
		});
	}
	
	/**
	 * Displays the message notifying users they can't post more than 3 comments across all sidewalks within 30 seconds
	 */
	onCommentSuspendThirty() {
		this.setState({
			thirtyCommentSuspend: true
		});
	}

	/**
	 * Hides the message notifying users they can't post more than 3 comments across all sidewalks within 30 seconds
	 */
	onDismissCommentSuspendThirty() {
		this.setState ({
			thirtyCommentSuspend: false
		});
	}

	/**
	 * Dismisses the message notifying the user that their comment was successfully posted
	 */
	onDismissCommentSuccessMessage() {
		this.setState({
			uploadCommentSucceeded: false
		});
	}
	
	/**
	 * Dismisses the message notifying the user that their comment was unable to be posted
	 */
	onDismissCommentErrorMessage() {
		this.setState({
			uploadCommentFailed: false
		});
	}
	
	/**
	 * Dismisses the message notifying the user that an error happened when uploading an image
	 */
	onDismissImageErrorMessage() {
		this.setState({
			uploadedImageError: false
		});
	}

	/**
	 * Dismisses the message notifying the user that their image was successfully uploaded
	 */
	onDismissImageSuccessMessage() {
		this.setState({
			uploadImageSucceeded: false
		});
	}

	/**
	 * Submits the user's ratings of the current sidewalk
	 */
	onUploadRatings(accessibility, comfort, connectivity, physicalSafety, senseOfSecurity, onSuccess) {
		this.setState({
			isUploadingRatings: true,
			successfullyUploadedRatings: false,
			failedUploadingRatings: false
		});
		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/rate`, {
			accessibility: parseFloat(accessibility),
			comfort: parseFloat(comfort),
			connectivity: parseFloat(connectivity),
			senseOfSecurity: parseFloat(senseOfSecurity),
			physicalSafety: parseFloat(physicalSafety)
		}).then((result) => {
			this.setState({
				isUploadingRatings: false,
				successfullyUploadedRatings: true
			});
			this.synchronizeSidewalk()
			return onSuccess();
		}).catch((error) => {
			this.setState({
				isUploadingRatings: false,
				failedUploadingRatings: true
			});
			console.error(error);
		});
	}

	onSuspendedSidewalk() {
		this.setState({
			sameSidewalkRatingError: true
		});
	}

	onDismissSuspendSidewalk() {
		this.setState({
			sameSidewalkRatingError: false
		});
	}

	onRateSuspendThirty() {
		this.setState({
			thirtySecondRatingError: true
		});
	}

	onDismissRateSuspendThirty() {
		this.setState ({
			thirtySecondRatingError: false
		});
	}

	onDismissRatingsSuccessMessage() {
		this.setState({
			successfullyUploadedRatings: false
		});
	}

	onDismissRatingsFailureMessage() {
		this.setState({
			failedUploadingRatings: false
		});
	}

	/**
	 * Removes the specified comment from the currently loaded sidewalk
	 * @param {Object} comment - the comment to remove
	 */
	onRemoveLoadedComment(comment) {
		const currentSidewalkComments = this.state.currentSidewalk.comments.slice(),
			index = currentSidewalkComments.indexOf(comment);
		if (index !== -1) {
			const newTotalComments = this.state.currentSidewalk.totalComments - 1;
			currentSidewalkComments.splice(index, 1);
			this.setState({
				currentSidewalk: Object.assign(this.state.currentSidewalk, {comments: currentSidewalkComments, totalComments: newTotalComments})
			});
		}
	}
	
	/**
	 * Removes the specified image from the currently loaded sidewalk
	 * @param {Object} image - the image to remove
	 * @param {function} onLastImageDeleted - a callback function that will be called if the deleted image is the last loaded one
	 * @param {function} onNoImagesRemaining - a callback function that will be called if there are no images remaining
	 */
	onRemoveLoadedImage(image, onLastImageDeleted, onNoImagesRemaining) {
		const index = this.state.loadedUserImages.indexOf(image);
		if (index !== -1) {
			const newImagesCount = this.state.currentSidewalk.totalImages - 1,
				newImages = this.state.loadedUserImages.slice(),
				sidewalkOverride = {totalImages: newImagesCount};			
			newImages.splice(index, 1);
			if (this.state.currentSidewalk.lastImage === image) {
				sidewalkOverride.lastImage = newImages[0] || null;
			}

			this.setState({
				currentSidewalk: Object.assign(this.state.currentSidewalk, sidewalkOverride),
				loadedUserImages: newImages
			});
			
			if (index === newImages.length && index > 0) {
				onLastImageDeleted(index);
			}
			if (newImages.length === 0) {
				return onNoImagesRemaining();
			}
		}
	}
	
	/**
	 * Loads comments from the database
	 * @param {number} startIndex - the amount of images to skip before starting to return them
	 * @param {number} endIndex - the index of the last item to load
	 * @param {function} updateStateCallback - a callback function that will be invoked when the comments are loaded
	 */
	onLoadComments(startIndex, endIndex, updateStateCallback) {
		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/comment`, {
			startIndex: startIndex,
			endIndex: endIndex
		}).then((res) => {
			const currentSidewalkComments = this.state.currentSidewalk.comments.slice().concat(res.comments);
			this.setState({
				hasNextCommentsPage: res.hasMoreComments,
				currentSidewalk: Object.assign(this.state.currentSidewalk, { comments: currentSidewalkComments })
			});
			return updateStateCallback();
		}).catch((err) => {
			console.error(err);
		});
	}

	/**
	 * Loads rating information for the currently selected sidewalk
	 * @param {function} successCallback - a callback function that will be invoked when the ratings are updated
	 */
	onGetSidewalkRatings(successCallback) {
		RestUtil.sendGetRequest(`sidewalk/${this.state.currentSidewalk.id}/ratings`).then((res) => {
			this.setState({
				currentSidewalk: Object.assign(this.state.currentSidewalk, res)
			});
			return successCallback();
		}).catch((err) => {
			console.error(err);
		});
	}

	/**
	 * Synchronizes the sidewalk's various rating values between ArcGIS and Django
	 */
	synchronizeSidewalk() {
		const query = window.featureLayer.createQuery();
		query.outFields = ["*"];
		window.featureLayer.queryFeatures(query).then(response => {
			if (response.features.length !== 0) {
				for (const matchingSidewalk of response.features) {
					if (this.state.currentSidewalk.id === parseInt(matchingSidewalk.attributes.osm_id)) {
						if (Math.round(this.state.currentSidewalk.overallRating) !== matchingSidewalk.attributes.AvgOverall) {
							matchingSidewalk.attributes.AvgOverall = Math.round(this.state.currentSidewalk.overallRating);
							matchingSidewalk.attributes.AvgAccessibility = this.state.currentSidewalk.accessibility
							matchingSidewalk.attributes.AvgComfort = this.state.currentSidewalk.comfort
							matchingSidewalk.attributes.AvgConnectivity = this.state.currentSidewalk.connectivity
							matchingSidewalk.attributes.AvgSecurity = this.state.currentSidewalk.senseOfSecurity
							matchingSidewalk.attributes.AvgSafety = this.state.currentSidewalk.physicalSafety
							
							const edits = {
								updateFeatures: [matchingSidewalk]
							};
							window.featureLayer.applyEdits(edits)
						}
					}
				}
			}
		}).catch((err) => {
			console.error("Failed query part", err);
		});
	}
	
	/**
	 * Performs the GET request to the API which returns the individual sidewalk data which will be exported to CSV
	 * @param {number} sidewalkId - the id of the sidewalk to download CSV data for
	 */
	onDownloadSidewalkCSV(sidewalkId) {
		RestUtil.sendGetRequest(`sidewalk/completeSummary`).then((allSidewalkObjects) => {
			const singleSidewalkData = [];
			singleSidewalkData.push(['SidewalkId', 'AccessibilityRating', 'Comfort', 'Connectivity', 'SenseOfSecurity', 'PhysicalSafety', 'OverallRating', 'TotalRatings', 'TotalComments', 'TotalImages']);
			allSidewalkObjects.sidewalks.forEach((sidewalk) => {
				if (sidewalk.id === sidewalkId) {
					singleSidewalkData.push([sidewalk.id, sidewalk.accessibility, sidewalk.comfort, sidewalk.connectivity, sidewalk.senseOfSecurity, sidewalk.physicalSafety, sidewalk.overallRating, sidewalk.ratings, sidewalk.comments, sidewalk.images]);
				}
			});
			this.setState({
				sidewalkCSVInfo: allSidewalkObjects,
				sidewalkCsvFormatted: singleSidewalkData,
				sidewalkHasCSVData: true
			});
		}).catch((err) => {
			console.error(err);
		});
	}
}