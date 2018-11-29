import React from "react";
import Reflux from "reflux";

import CloseIcon from "@material-ui/icons/Close";
import Avatar from '@material-ui/core/Avatar';
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

import AdminStore from "./AdminStore";
import AdminActions from "./AdminActions";
import InfiniteImageGalleryCarousel from "../images/InfiniteImageGalleryCarousel.jsx";
import SuccessAlertComponent from "../misc-components/SuccessAlertComponent";
import ErrorAlertComponent from "../misc-components/ErrorAlertComponent";

/**
 * This component handles the view where administrators can approve/reject images uploaded to sidewalks
 */
export default class PendingImagesGallery extends Reflux.Component {
	
	constructor(props) {
		super(props);
		this.store = AdminStore;
		this.state = {};
		this.galleryRef = React.createRef();
	}

	componentDidMount(prevProps) {
		this._loadMoreImages(0, 10);
	}
	
	/**
	 * Loads more images to display
	 * @param {number} startIndex - the starting index of new items to load
	 * @param {number} stopIndex - the ending index of new items to load
	 */
	_loadMoreImages = (startIndex, stopIndex) => {
		AdminActions.getUnapprovedImages(startIndex, stopIndex);
	};
	
	/**
	 * Handles the user approving an image
	 * @param {Object} image - the image to approve
	 */
    _onAcceptImage = (image) => {
		AdminActions.handlePendingImages(true, image.id, image.sidewalk.id);
    }

	/**
	 * Handles the user rejecting an image
	 * @param {Object} image - the image to reject
	 */
    _onRejectImage = (image) => {
		AdminActions.handlePendingImages(false, image.id, image.sidewalk.id);
    }

	/**
	 * Renders the approve and reject buttons for the selected image
	 * @return {JSX} - the buttons if the image is selected
	 */
	_renderResponseButtons = () => {
		return (
			 <Grid container>
				<Grid item>
					<Tooltip title="Reject this image">
						<Avatar className="imageDeleteAvatar" onClick={() => {this._onRejectImage(this.state.pendingImages[this.galleryRef.current.getCurrentIndex()])}}>
							<CloseIcon />
						</Avatar>
					</Tooltip>
				</Grid>
				<Grid item>
					<Tooltip title="Approve this image">
						<Avatar className="imageApproveAvatar" onClick={() => {this._onAcceptImage(this.state.pendingImages[this.galleryRef.current.getCurrentIndex()])}}>
							<CheckCircleIcon />
						</Avatar>
					</Tooltip>
				</Grid>
			</Grid>
		);
	};
	
	_dismissNotifications = () => {
		AdminActions.dismissImageApprovalNotification();
		AdminActions.dismissImageRejectionNotification();
	};

	render() {
		if (this.state.pendingImages.length === 0) {
			return null;
		}
		return (
			<div>
				<InfiniteImageGalleryCarousel
					loadedImages={this.state.pendingImages}
					hasNextPage={this.state.hasMoreImages}
					loadMoreData={this._loadMoreImages}
					visible={this.state.pendingImages.length > 0}
					isNextPageLoading={this.state.isNextPageLoading}
					onClose={() => {}}
					renderAboveImage={this._renderResponseButtons}
					ref={this.galleryRef}
					noDrawer
				/>
				<SuccessAlertComponent onClose={this._dismissNotifications}
						 visible={this.state.successfullyRespondedToImage}
						 message="Your response has been recorded."
				/>
				<ErrorAlertComponent onClose={this._dismissNotifications}
						 visible={this.state.failedToRespondToImage}
						 message="An error occurred while recording your response."
				/> 
			</div>
		);
	}
}