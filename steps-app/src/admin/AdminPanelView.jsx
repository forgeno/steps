import React from "react";
import Reflux from "reflux";

import CloseIcon from "@material-ui/icons/Close";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import InfiniteImageGallery from "../images/InfiniteImageGallery";
import AdminStore from "./AdminStore";
import AdminActions from "./AdminActions";

import SuccessAlertComponent from "../misc-components/SuccessAlertComponent";
import ErrorAlertComponent from "../misc-components/ErrorAlertComponent";

/**
 * This component renders the gallery of all uploaded images that have yet to be approved or rejected
 */
export default class AdminDrawerImageGallery extends Reflux.Component {
	
    constructor(props) {
        super(props);
        this.store = AdminStore;
        this.state = {
        }
    }
    
    componentDidMount() {
		AdminActions.getUnapprovedImages(0, 5);
    }
    
	_dismissNotifications = () => {
		AdminActions.dismissImageApprovalNotification();
		AdminActions.dismissImageRejectionNotification();
	};
	
	loadMoreImages = (startIndex, stopIndex) => {
		this.setState({
			isNextPageLoading: true
		});
        AdminActions.getUnapprovedImages(startIndex, stopIndex, () => {
            setTimeout(() => {
				this.setState({
					isNextPageLoading: false
				});
			}, 50);
        });
    };

	/**
	 * Handles the user approving an image
	 * @param {Object} image - the image to approve
	 */
    _onAcceptImage = (image) => {
        AdminActions.handlePendingImages(true, image.id);
    }

	/**
	 * Handles the user rejecting an image
	 * @param {Object} image - the image to reject
	 */
    _onRejectImage = (image) => {
        AdminActions.handlePendingImages(false, image.id);
    }

	/**
	 * Renders the approve and reject buttons for the selected image
	 * @param {boolean} selected - whether the image to render the button over is selected or not
	 * @param {Object} image - details about the image object
	 * @return - null if the image is not selected, or the buttons if the image is selected
	 */
	_renderResponseButtons = (selected, image) => {
		if (!selected || !this.state.isLoggedIn) {
			return null;
		}
		
		return (
			<div>
				<CloseIcon className="closeButton" onClick={() => {this._onRejectImage(image)}} />
				<CheckCircleIcon className="acceptButton" onClick={() => {this._onAcceptImage(image)}} />
			</div>
		);
	};
	
	render() {
        if (!this.state.pendingImages) {
			return <h1>No images uploaded</h1>;
		}
		
		const styles = {
			paper: {
				margin: "65px 0px 0px 0px"
			}
		};
		return (   
			<div>       
				<InfiniteImageGallery
					classes={styles}
					loadedImages={this.state.pendingImages}
					hasNextPage={this.state.hasMoreImages}
					loadMoreData={this.loadMoreImages}
					visible={true}
					isNextPageLoading={this.state.isNextPageLoading}
					renderAboveImage={this._renderResponseButtons}
				>
				</InfiniteImageGallery>
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