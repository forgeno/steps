import React from "react";
import { Component } from "reflux";
import { Alert } from "react-bootstrap";

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";

import ImageUploadModal from "../images/ImageUploadModal";
import UploadSidewalkImageComponent from "./UploadSidewalkImageComponent";
import PreviewSidewalkImagesComponent from "./PreviewSidewalkImagesComponent";
import SidewalkImagesView from "./SidewalkImagesView";
import LoaderComponent from "../misc-components/LoaderComponent";

/**
 * This component handles rendering details about a selected sidewalk
 */
export default class SidewalkDetailsView extends Component {

	constructor(props) {
		super(props);
		this.state = {
			modalOpened: false,
			viewingImages: false
		};
		this.store = Store;
	}

	/**
	 * Opens the modal allowing the user to upload images
	 */
	_openImageModal = () => {
		this.setState({
			modalOpened: true
		});
	};

	/**
	 * Closes the image upload modal
	 * @param {String?} - the base64 encoded string representing the image the user uploaded if valid, or undefined otherwise
	 */
	_closeImageModal = (uploadedFile) => {
		this.setState({
			modalOpened: false
		});
		if (uploadedFile) {
			Actions.uploadSidewalkImage(uploadedFile);
		}
	};
	
	/**
	 * Opens up the uploaded images view
	 */
	_viewImages = () => {
		this.setState({
			viewingImages: true
		});
	};
	
	/**
	 * Closes the uploaded images view
	 */
	_closeImages = () => {
		this.setState({
			viewingImages: false
		});
	};
	
	render() {
		return (
			<div>
				<UploadSidewalkImageComponent onClick={this._openImageModal} />
				{
					this.state.uploadedImageError && (
						<Alert bsStyle="danger">
							An error occurred while uploading the image.
						</Alert>
					)
				}
				{
					this.state.uploadingSidewalkImage && (
						<div>
							<span>Uploading</span>
							<LoaderComponent />
						</div>
					)
				}
				<PreviewSidewalkImagesComponent previewImage="" onClick={this._viewImages} />
				<ImageUploadModal visible={this.state.modalOpened} onClose={this._closeImageModal} />
				<SidewalkImagesView onClose={this._closeImages} visible={this.state.viewingImages} />
			</div>
		);
	}

}