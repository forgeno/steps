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
			username: "",
			password: "",
			credentialError: false,
			pendingImages: [],
			sidewalkCSVInfo: [],
			hasCSVData: false
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
	
	// TODO: remove hardcoded sidewalkId value
	onHandlePendingImages(accepted, imageId, sidewalkId = "2") {
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

	onGetUnapprovedImages(startIndex, endIndex, onSuccess) {
		RestUtil.sendPostRequest(`sidewalk/unapprovedImages`, { 
			username: this.state.username,
			password: this.state.password,
			startIndex: startIndex,
			endIndex: endIndex
		}).then((result) => {
			const newImages = this.state.pendingImages.slice().concat(result.images);
			this.setState({
				hasMoreImages: result.hasMoreImages,
				pendingImages: newImages
			});
			return onSuccess();
		}).catch((error) => {
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

	onDownloadCSV() {
		RestUtil.sendGetRequest(`sidewalk/completeSummary`).then((allSidewalkObjects) => {
			const allSidewalkArray = [];
			allSidewalkArray.push(['SidewalkId', 'AccessibilityRating', 'Comfort', 'Connectivity', 'SenseOfSecurity', 'PhysicalSafety', 'OverallRating', 'TotalRatings', 'TotalComments', 'TotalImages']);
			allSidewalkObjects.sidewalks.forEach((sidewalk) => {
				let data = [sidewalk.id, sidewalk.accessibility, sidewalk.comfort, sidewalk.connectivity, sidewalk.senseOfSecurity, sidewalk.physicalSafety, sidewalk.overallRating, sidewalk.ratings, sidewalk.comments, sidewalk.images];
				allSidewalkArray.push(data);
			});
			this.setState({
				sidewalkCSVInfo: allSidewalkObjects,
				csvFormatted: allSidewalkArray,
				hasCSVData: true
			});
		}).catch((err) => {
			console.error(err);
		});
	}
}
