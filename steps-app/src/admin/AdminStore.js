import Reflux from "reflux";

import Actions from "./AdminActions";
import RestUtil from "../util/RestUtil";
import {LOCAL_STORAGE_NAME, SUSPENSION_COOKIE} from "../constants/AdminConstants";
import SpamUtil from "../util/SpamUtil";

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
			username: "",
			password: "",
			credentialError: false,
			pendingImages: [],
			isNextPageLoading: false
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
			return onFinish(true);
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

	onCheckCredentials(user, pass) {
		RestUtil.sendPostRequest('adminAccount/login',{
			username: user,
			password: pass
		}).then((res) => {
			this.setState({
				isLoggedIn: true,
				successfullyLoggedIn: true,
				username: user,
				password: pass
			});
		}).catch((err) => {
			this.setState({
				isLoggedIn: false,
				failedToLogIn: true
			});
			if (err.statusCode === 401) {
				if (SpamUtil.getCookie(SUSPENSION_COOKIE) !== true) {
					SpamUtil.setLocalStorage(LOCAL_STORAGE_NAME)
				}
			}
			console.error(err)
		});
	}

	onLogoutAdmin(){
		this.setState({
			isLoggedIn: false
		});
	}

	/**
	 * Handles attempting to delete an image
	 * @param {String} sidewalkId - the ID of the sidewalk the image is linked to
	 * @param {String} imageId - the ID of the image to delete
	 * @param {function} onFinish - callback function that is called once the request has been resolved. 
	 *					 The first parameter indicates whether the request was succesful or not
	 */
	onDeleteImage(sidewalkId, imageId, onFinish){
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
	onDismissImageErrorMessage(){
		this.setState({
			failedDeleteImage: false
		});
	}

	/**
	 * Dismisses the message that notifies the user that they have successfully deleted a comment
	 */
	onDismissLoginSuccess() {
		this.setState({
			successfullyLoggedIn: false
		});
	}
	
	/**
	 * Dismisses the message that notifies the user that they have successfully deleted a comment
	 */
	onDismissLoginError() {
		this.setState({
			failedToLogIn: false
		});
	}
	
	onHandlePendingImages(accepted, imageId, sidewalkId) {
		this.setState({
			respondingToImage: true,
			successfullyRespondedToImage: false,
			failedToRespondToImage: false
		});
		RestUtil.sendPostRequest(`sidewalk/${sidewalkId}/image/respond`, {
			username: this.state.username,
			password: this.state.password,
			accepted: accepted,
			imageId: imageId
		}).then((result) => {
			const newImages = this.state.pendingImages.filter((image) => image.id !== imageId);
			this.setState({
				respondingToImage: false,
				successfullyRespondedToImage: true,
				pendingImages: newImages
			});
		}).catch((error) => {
			this.setState({
				respondingToImage: false,
				failedToRespondToImage: true
			});
			console.error(error);
		});
	}

	onGetUnapprovedImages(startIndex, endIndex) {
		this.setState({
			isNextPageLoading: true
		})
		RestUtil.sendPostRequest(`sidewalk/unapprovedImages`, { 
			username: this.state.username,
			password: this.state.password,
			startIndex: startIndex,
			endIndex: endIndex
		}).then((result) => {
			const newImages = this.state.pendingImages.slice().concat(result.images);
			this.setState({
				hasMoreImages: result.hasMoreImages,
				pendingImages: newImages,
				isNextPageLoading: false
			});
		}).catch((error) => {
			this.setState({
				isNextPageLoading: false
			});
			console.error(error);
		})
	}
	
	onDismissImageApprovalNotification() {
		this.setState({
			successfullyRespondedToImage: false,
		});
	}
	
	onDismissImageRejectionNotification() {
		this.setState({
			failedToRespondToImage: false,
		});
	}

	onAdminImageClicked(imageIndex) {
		this.setState({
			currentImageIndex: imageIndex
		});
	}

}