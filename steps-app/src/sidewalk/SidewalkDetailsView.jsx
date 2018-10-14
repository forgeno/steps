import React from "react";
import { Component } from "reflux";

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";
import ImageUploadModal from "../images/ImageUploadModal";
import UploadSidewalkImageComponent from "./UploadSidewalkImageComponent";

/**
 * This component handles rendering details about a selected sidewalk
 */
export default class SidewalkDetailsView extends Component {

	constructor(props) {
		super(props);
		this.state = {
			modalOpened: false
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

	render() {
		return (
			<div>
				<UploadSidewalkImageComponent onClick={this._openImageModal} />
				<ImageUploadModal visible={this.state.modalOpened} onClose={this._closeImageModal} />
			</div>
		);
	}

}