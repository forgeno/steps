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
		};
	}

	/**
	 * Loads data about the specified sidewalk
	 * @param {Object} sidewalk - a basic summary of the sidewalk to load, including it's id and average ratings
	 */
	onLoadSidewalkDetails(sidewalk) {
		this.setState(this._getDefaultSidewalkState());
		RestUtil.sendGetRequest(`sidewalk/${sidewalk.id}`).then((data) => {
			
			const newSidewalk = Object.assign({}, sidewalk, data);
			this.setState({
				currentSidewalk: newSidewalk,
				hasNextImagesPage: newSidewalk.lastImage,
				loadedUserImages: [newSidewalk.lastImage],
				accessibilityValue: newSidewalk.accessibility
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
	 * @param {number} startIndex - the index of the last item to load
	 * @param {function} updateStateCallback - a callback function that will be invoked when the images are loaded
	 */
	onLoadUploadedImages(startIndex, stopIndex, updateStateCallback) {
		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/image`, {
			startIndex: startIndex,
			endIndex: stopIndex
		}).then((res) => {
			this.setState({
				hasNextImagesPage: res.hasMoreImages,
				loadedUserImages: this.state.loadedUserImages.slice(0).concat(res.images)
			});
			return updateStateCallback();
		}).catch((err) => {
			console.error(err);
		});
	}

	/**
	 * Uploads a comment to the database for the current sidewalk
	 * @param {String} comment - the comment to upload
	 */
	onUploadComment(comment) {
		this.setState({
			uploadingComment: true
		});
		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/comment/create`, {
			text: comment
		}).then((res) => {
			const currentSidewalkComments = this.state.currentSidewalk.comments.slice();
			currentSidewalkComments.unshift(res);
			this.setState({
				uploadingComment: false,
				uploadCommentFailed: false,
				commentHint: "Comment Successfully Uploaded!",
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
	 * Handles the user uploading the ratings
	 */

	onUploadRatings(accessibility, comfort, connectivity, physicalSafety, senseOfSecurity) {

		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/rate`, {
			accessibility: parseFloat(accessibility),
			comfort: parseFloat(comfort),
			connectivity: parseFloat(connectivity),
			senseOfSecurity: parseFloat(senseOfSecurity),
			physicalSafety: parseFloat(physicalSafety)
			
		}).then((result) => {
			this.setState({
				accessibility: 3,
				comfort: 3,
				connectivity: 3,
				physicalSafety: 3,
				senseOfSecurity: 3
			});
		}).catch((error) => {
			console.error(error);
			

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
}