import React from "react";
import Reflux from "reflux";

import Store from "../SidewalkStore";
import Actions from "../SidewalkActions";

import ImageUploadModal from "../../images/ImageUploadModal";
import UploadSidewalkImageComponent from "./UploadSidewalkImageComponent";
import PreviewSidewalkImagesComponent from "./PreviewSidewalkImagesComponent";
import LoaderComponent from "../../misc-components/LoaderComponent";

/**
 * This component renders the image section of the sidewalk drawer
 */
export default class SidewalkImageDetailsComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
		this.state = {
			modalOpened: false
		};
	}

	/**
	 * Opens up the uploaded images view
	 */
	_viewImages = () => {
		this.props.onOpenImages();
	};

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

	render() {
		if (!this.state.currentSidewalk) {
			return null;
		}
		return (
			<div>
				<PreviewSidewalkImagesComponent imageCount={this.state.currentSidewalk.totalImages} previewImage={this.state.currentSidewalk.lastImage.url} onClick={this._viewImages} />
				<UploadSidewalkImageComponent onClick={this._openImageModal} />
				{
					this.state.uploadingSidewalkImage && (
						<div className="marginTop10">
							<span className="marginRight10">Uploading...</span>
							<LoaderComponent />
						</div>
					)
				}
				<ImageUploadModal visible={this.state.modalOpened} onClose={this._closeImageModal} />
			</div>
		);
	}
}