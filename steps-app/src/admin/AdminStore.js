import Reflux from "reflux";

import Actions from "./AdminActions";
import RestUtil from "../util/RestUtil";

/**
 * This store keeps track of the state of components that deal with administrator actions
 */
export default class AdminStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {
			isLoggedIn: false,
			isDeletingComment: false,
			successfullyDeletedComment: false,
			failedDeleteComment: false,
			username: "stepsAdmin",
			password: ""
		};
        this.listenables = Actions;

		if (process.env.NODE_ENV === "development"){
			window.DEV_ADMIN_STORE = this;
		}
    }

	/**
	 * Handles attempting to delete a comment
	 * @param {String} sidewalkId - the ID of the sidewalk the comment is linked to
	 * @param {String} commentId - the ID of the comment to delete
	 * @param {function} onFinish - callback function that is called once the request has been resolved. 
	 *					 The first parameter indicates whether the request was succesful or not
	 */
	onDeleteComment(sidewalkId, commentId, onFinish) {
		this.setState({
			isDeletingComment: true,
			successfullyDeletedComment: false,
			failedDeleteComment: false
		});
		
		RestUtil.sendPostRequest(`sidewalk/${sidewalkId}/comment/delete`, {
			id: commentId,
			username: this.state.username,
			password: this.state.password
		}).then(() => {
			this.setState({
				isDeletingComment: false,
				successfullyDeletedComment: true
			});
			onFinish(true);
		}).catch((err) => {
			this.setState({
				isDeletingComment: false,
				failedDeleteComment: true
			});
			onFinish(false);
			console.error(err);
		});
	}
	
	/**
	 * Dismisses the message that notifies the user that they have successfully deleted a comment
	 */
	onDismissCommentSuccessMessage() {
		this.setState({
			successfullyDeletedComment: false
		});
	}
	
	/**
	 * Dismisses the message that notifies the user that they have failed to deleted a comment
	 */
	onDismissCommentErrorMessage() {
		this.setState({
			failedDeleteComment: false
		});
	}
	
	/**
	 * Handles attempting to delete an image
	 * @param {String} sidewalkId - the ID of the sidewalk the image is linked to
	 * @param {String} imageId - the ID of the image to delete
	 * @param {function} onFinish - callback function that is called once the request has been resolved. 
	 *					 The first parameter indicates whether the request was succesful or not
	 */
	onDeleteImage(sidewalkId, imageId, onFinish) {
		this.setState({
			isDeletingImage: true,
			successfullyDeletedImage: false,
			failedDeleteImage: false
		});
		
		RestUtil.sendPostRequest(`sidewalk/${sidewalkId}/image/delete`, {
			imageId: imageId,
			username: this.state.username,
			password: this.state.password
		}).then(() => {
			this.setState({
				isDeletingImage: false,
				successfullyDeletedImage: true
			});
			return onFinish(true);
		}).catch((err) => {
			this.setState({
				isDeletingImage: false,
				failedDeleteImage: true
			});
			console.error(err);
			return onFinish(false);
		});
	}
	
	/**
	 * Dismisses the message that notifies the user that they have successfully deleted an image
	 */
	onDismissImageSuccessMessage() {
		this.setState({
			successfullyDeletedImage: false
		});
	}
	
	/**
	 * Dismisses the message that notifies the user that they have failed to deleted an image
	 */
	onDismissImageErrorMessage() {
		this.setState({
			failedDeleteImage: false
		});
	}
	
	onHandlePendingImages(accepted, imageId) {
		RestUtil.sendPostRequest(`sidewalk/2/image/respond`, {
			username: this.state.username,
			password: "716481e86d31433e772f52de60b915c4",
			accepted: accepted,
			imageId: String(imageId)
		}).then((result) => {
			this.onGetUnapprovedImages(0,5); //dont hardcode
		}).catch((error) => {
			console.error(error);
		});
	}

	onGetUnapprovedImages(startingIndex, endingIndex) {
		RestUtil.sendPostRequest(`sidewalk/unapprovedImages`, { 
			username: this.state.username,
			password: "716481e86d31433e772f52de60b915c4", // needs to be unhashed
			startIndex: startingIndex,
			endIndex: endingIndex
		}).then((result) => {
			this.setState({
				hasMoreImages: result.hasMoreImages,
				pendingImages: result.images
			})
		}).catch((error) => {
			console.error(error);
		})
	}
}
