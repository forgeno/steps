import React from "react";
import Reflux from "reflux";

import {CSVLink, CSVDownload} from 'react-csv';
import CloseIcon from "@material-ui/icons/Close";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import MasonryInfiniteScroller from "react-masonry-infinite";
import Card from '@material-ui/core/Card';
import { Button } from "react-bootstrap"
import AdminStore from "./AdminStore";
import AdminActions from "./AdminActions";
import LoaderComponent from "../misc-components/LoaderComponent";

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
			currentImageIndex: 0
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
	
	loadMoreImages = () => {
		this.setState({
			isNextPageLoading: true
		});
        AdminActions.getUnapprovedImages(this.state.pendingImages.length, this.state.pendingImages.length + 10, () => {
            setTimeout(() => {
				this.setState({
					isNextPageLoading: false
				});
			}, 500);
        });
	};
	
	getCSVData = () => {
		AdminActions.downloadCSV();
	}

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
	
	/**
	 * Handles an image being clicked
	 * @param {number} index - the index of the image that was just clicked
	 */
	_onImageClicked = (index) => {
		this.setState({
			currentImageIndex: index
		});
	};
	
	/**
	 * Gets whether the specified item is loaded
	 * @param {number} index - the index of the item in the list of all loaded items
	 * @return {boolean} - whether the specified item is loaded
	 */
	_isRowLoaded = (index) => {
		return Boolean(this.state.pendingImages[index]);
	};
	
	/**
	 * Renders the specified item
	 * @param {number} index - the index of the item in the list of loaded items
	 * @param {*} key - the unique key of this item
	 * @param {Object} style - the object's div style to render
	 * @return {JSX} - the item to render
	 */
	_rowRenderer = ({index, key, style}) => {
		let content;
		if (this._isRowLoaded(index)) {
			content = (
				<div className={this.state.currentImageIndex === index ? "infiniteImageRowSelected" : "infiniteImageRowUnselected"}>
					<Card className="clickableItem">
						{this.props.renderAboveImage && this.props.renderAboveImage(this.state.currentImageIndex === index, this.state.pendingImages[index])}
						<img onClick={() => {this._onImageClicked(index)}} className="img-responsive fillAvailable" alt="uploaded" src={this.state.pendingImages[index].url} />
					</Card>
				</div>
			);
		} else {
			content = <LoaderComponent />;
		}
		return (
			<div key={key} style={style}>
				{content}
			</div>
		);
	};
	
	renderSelectedImage() {
		if (this.state.pendingImages[this.state.currentImageIndex]) {
			return (
				<img className="backgroundImage"
					alt="selected"
					src={this.state.pendingImages[this.state.currentImageIndex].url} />
			);
		}
		return <LoaderComponent />;
	}
	
	render() {
        if (!this.state.pendingImages || this.state.pendingImages.length === 0) {
			return <h1>No images uploaded</h1>;
		}

		
		// TODO: use react image gallery with html observer event to load more
		return (   
			<div>
				{this.renderSelectedImage()}
				{this.state.hasCSVData && <CSVLink data={this.state.csvFormatted}>
					<Button bsStyle = "primary" className = "csvButton">
						EXPORT CSV
					</Button>
				</CSVLink>}

				<MasonryInfiniteScroller
					hasMore={this.state.hasMoreImages}
					loadMore={this.state.isNextPageLoading ? () => {} : this.loadMoreImages}
					sizes={[{ columns: 3, gutter: 0 },
					{ mq: '1024px', columns: 4, gutter: 0 }]}
				>
					{
						this.state.pendingImages.map((id, index) =>
							this._rowRenderer({index: index, key: index, style: {height: "30vw", width: "30vw"}})
						)
					}
				</MasonryInfiniteScroller>
				{this.state.isNextPageLoading && <LoaderComponent />}
				
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