import React from "react";
import Reflux from "reflux";

import CloseIcon from "@material-ui/icons/Close";

import InfiniteImageGallery from "../../images/InfiniteImageGallery";
import SidewalkStore from "../SidewalkStore";
import SidewalkActions from "../SidewalkActions";
import AdminStore from "../../admin/AdminStore";
import ImageDeletionModal from "./ImageDeletionModal";

/**
 * This component handles the view where the user can see all of the images posted to a sidewalk
 */
export default class SidewalkUploadedImagesGallery extends Reflux.Component {
	
	constructor(props) {
		super(props);
		this.stores = [SidewalkStore, AdminStore];
		this.state = {
			isNextPageLoading: false,
			modalOpened: false
		};
		this.galleryRef = React.createRef();
	}

	/**
	 * Loads more images to display
	 * @param {number} startIndex - the starting index of new items to load
	 * @param {number} stopIndex - the ending index of new items to load
	 */
	_loadMoreImages = (startIndex, stopIndex) => {
		this.setState({
			isNextPageLoading: true
		});
		SidewalkActions.loadUploadedImages(startIndex, stopIndex, () => {
			setTimeout(() => {
				this.setState({
					isNextPageLoading: false
				});
			}, 50);
		});
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
	 * @param {boolean} selected - whether the image to render the button over is selected or not
	 * @param {Object} image - details about the image object
	 * @return - null if the image is not selected, or the close button if the image is selected
	 */
	_renderDeleteButton = (selected, image) => {
		if (!selected || !this.state.isLoggedIn) {
			return null;
		}
		
		return <CloseIcon className="closeButton" onClick={() => {this._onDeleteImageClicked(image)}} />
	};
	
	render() {
		if (!this.state.currentSidewalk) {
			return null;
		}
		return (
			<div>
				<InfiniteImageGallery
					loadedImages={this.state.loadedUserImages}
					hasNextPage={this.state.hasNextImagesPage}
					loadMoreData={this._loadMoreImages}
					visible={this.props.visible}
					isNextPageLoading={this.state.isNextPageLoading}
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