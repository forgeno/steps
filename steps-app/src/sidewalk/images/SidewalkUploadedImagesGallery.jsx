import React from "react";
import Reflux from "reflux";

import CloseIcon from "@material-ui/icons/Close";
import Avatar from '@material-ui/core/Avatar';

import SidewalkStore from "../SidewalkStore";
import SidewalkActions from "../SidewalkActions";
import AdminStore from "../../admin/AdminStore";
import ImageDeletionModal from "./ImageDeletionModal";
import InfiniteImageGalleryCarousel from "../../images/InfiniteImageGalleryCarousel.jsx";

/**
 * This component handles the view where the user can see all of the images posted to a sidewalk
 */
export default class SidewalkUploadedImagesGallery extends Reflux.Component {
	
	constructor(props) {
		super(props);
		this.stores = [SidewalkStore, AdminStore];
		this.state = {
			modalOpened: false
		};
		this.galleryRef = React.createRef();
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.visible && this.props.visible && this.state.loadedUserImages.length < 2 && this.state.hasNextImagesPage) {
			this._loadMoreImages(this.state.loadedUserImages.length, 10);
		}
	}
	
	/**
	 * Loads more images to display
	 * @param {number} startIndex - the starting index of new items to load
	 * @param {number} stopIndex - the ending index of new items to load
	 */
	_loadMoreImages = (startIndex, stopIndex) => {
		SidewalkActions.loadUploadedImages(startIndex, stopIndex);
	};
	
	/**
	 * Handles the delete image button being clicked
	 */
	_onDeleteImageClicked = (image) => {
		this.setState({
			modalOpened: true,
			selectedImage: image
		});
	};
	
	/**
	 * Handles the modal asking the user to confirm their deletion attempt being closed
	 * @param {boolean} deleted - whether the image was successfully deleted or not
	 */
	_onModalClosed = (deleted) => {
		if (deleted) {
			SidewalkActions.removeLoadedImage(this.state.selectedImage, (index) => {
				this.galleryRef.current._onImageClicked(index - 1);
			}, () => {
				this.props.onClose();
			});
		}

		this.setState({
			modalOpened: false,
			selectedImage: null
		});
	};
	
	/**
	 * Renders the button allowing the user to delete the currently selected image
	 * @return - null if the image is not selected, or the close button if the image is selected
	 */
	_renderDeleteButton = () => {
		if (!this.state.isLoggedIn) {
			return null;
		}
		
		return (
			<Avatar className="imageDeleteAvatar" onClick={() => {this._onDeleteImageClicked(this.state.loadedUserImages[this.galleryRef.current.getCurrentIndex()])}}>
				<CloseIcon />
			</Avatar>
		);
	};
	
	render() {
		if (!this.state.currentSidewalk) {
			return null;
		}
		
		return (
			<div>
				<InfiniteImageGalleryCarousel
					loadedImages={this.state.loadedUserImages}
					hasNextPage={this.state.hasNextImagesPage}
					loadMoreData={this._loadMoreImages}
					visible={this.props.visible}
					isNextPageLoading={this.state.isNextImagePageLoading}
					onClose={this.props.onClose}
					renderAboveImage={this._renderDeleteButton}
					ref={this.galleryRef}
				/>
				<ImageDeletionModal visible={this.props.visible && this.state.modalOpened}
									onClose={this._onModalClosed}
									sidewalkId={this.state.currentSidewalk.id}
									image={this.state.selectedImage} />
			</div>
		);
	}
}