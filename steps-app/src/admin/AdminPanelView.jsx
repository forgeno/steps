import React from "react";
import Reflux from "reflux";

import {CSVLink, CSVDownload} from 'react-csv';
import CloseIcon from "@material-ui/icons/Close";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import { Button } from "react-bootstrap"
import AdminStore from "./AdminStore";
import AdminActions from "./AdminActions";

// import InfiniteCarousel from "../misc-components/InfiniteCarousel";
import {Carousel, Image} from "react-bootstrap";
import InfiniteImagePreviewer from "../misc-components/InfiniteImagePreviewer";
import SuccessAlertComponent from "../misc-components/SuccessAlertComponent";
import ErrorAlertComponent from "../misc-components/ErrorAlertComponent";
import SpamUtil from "../util/SpamUtil";

/**
 * This component renders the gallery of all uploaded images that have yet to be approved or rejected
 */
export default class AdminDrawerImageGallery extends Reflux.Component {
	
    constructor(props) {
        super(props);
        this.store = AdminStore;
        this.state = {
			direction: null
		};
	}
    
    componentDidMount() {
		if(!this.state.isLoggedIn){
			this.props.history.push('/login');
		}
		else {
			AdminActions.getUnapprovedImages(0, 5);
			this.getCSVData();
		}
		
    }
    
	_dismissNotifications = () => {
		AdminActions.dismissImageApprovalNotification();
		AdminActions.dismissImageRejectionNotification();
	};

	loadNextPage = () => {
		this.setState({
			isNextPageLoading: true
		})
	}
	
	loadMoreImages = () => {

		const index = this.state.currentImageIndex,
			currentPendingLength = this.state.pendingImages.length,
		loadImagesThreshold = (index/currentPendingLength) > 0.5;

		if( this.state.hasMoreImages && ((loadImagesThreshold || (currentPendingLength <= 4)))) {
			AdminActions.getUnapprovedImages(this.state.pendingImages.length, this.state.pendingImages.length + 10
		)}
		return;
	};

	getCSVData = () => {
		AdminActions.downloadCSV();
	}

	loadImagesByPreview = () => {
		AdminActions.getUnapprovedImages(this.state.pendingImages.length, this.state.pendingImages.length + 10);
	};

	/**
	 * Handles the user approving an image
	 * @param {Object} image - the image to approve
	 */
    _onAcceptImage = (image) => {
		AdminActions.handlePendingImages(true, image.id, image.sidewalk.id);
		this.loadMoreImages();
    }

	/**
	 * Handles the user rejecting an image
	 * @param {Object} image - the image to reject
	 */
    _onRejectImage = (image) => {
		AdminActions.handlePendingImages(false, image.id, image.sidewalk.id);
		this.loadMoreImages();
    }

	/**
	 * Renders the approve and reject buttons for the selected image
	 * @param {boolean} selected - whether the image to render the button over is selected or not
	 * @param {Object} image - details about the image object
	 * @return - null if the image is not selected, or the buttons if the image is selected
	 */
	_renderResponseButtons = (image) => {
		if (!this.state.isLoggedIn) {
			return null;
		}

		return (
			<div>
				<CloseIcon className="adminReject" onClick={() => {this._onRejectImage(image)}} />
				<CheckCircleIcon className="adminAccept" onClick={() => {this._onAcceptImage(image)}} />
			</div>
		);
	};


	setImageIndex = (selectedIndex) => {
		AdminActions.adminImageClicked(selectedIndex);
	}

	handleOnClick = (selectedIndex, event) => {
		this.setState({
			currentImageIndex: selectedIndex,
			direction: event.direction,
		});
        this.loadMoreImages();
        this.setImageIndex(selectedIndex);
    }

	shouldDisableCarouselArrows(index, length) {
		if (index === 0) {
			return "disableLeftCarouselArrow";
		} else if (index === length - 1) {
			return "disableRightCarouselArrow";
		} else {
			return "";
		}
	}


	render() {
		
		const pendingImages = this.state.pendingImages,
			index = this.state.currentImageIndex,
			image = pendingImages[index],
			showAdminImages = !(pendingImages.length === 0);

		return (   
			<div>
				{this.state.hasCSVData && <CSVLink data={this.state.csvFormatted}>
					<Button bsStyle = "primary" className = "csvButton">
						EXPORT CSV
					</Button>
				</CSVLink>}
				{!showAdminImages && <h1> No Images Uploaded</h1>}
				{showAdminImages && this._renderResponseButtons(image)}
				{showAdminImages && <div className={this.shouldDisableCarouselArrows(index, pendingImages.length)}>
					<Carousel
						indicators={false}
						activeIndex={this.state.currentImageIndex}
						direction={this.state.direction}
						interval={null}
						onSelect={this.handleOnClick}
					>
						{pendingImages.map((image, id) => {
							return (
							<Carousel.Item key={String(id)}>
								<Image src={image.url}/>
							</Carousel.Item>);               
						})}
					</Carousel>
            	</div>}
				{showAdminImages &&<InfiniteImagePreviewer
					loadedImages={pendingImages}
					loadMoreImages={this.loadMoreImages}
					currentIndex={index}
					setImageIndex={this.setImageIndex}
					hasMoreImages={this.state.hasMoreImages}
					loadMoreByArrow={this.loadImagesByPreview}
					isNextPageLoading={this.loadNextPage}
				/>}
			
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