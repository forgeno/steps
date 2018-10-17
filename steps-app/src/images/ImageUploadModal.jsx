import React from "react";
import {Modal, Button, Alert} from "react-bootstrap";

import {getFile, bytesToMB} from "../util/FileUtilities";
import ImageSelectorComponent from "./ImageSelectorComponent";
import LoaderComponent from "../misc-components/LoaderComponent";
import {MAX_UPLOAD_SIZE} from "../constants/DatabaseConstants";

/**
 * This component renders a modal that allows the user to select an image from their local files,
 * and then upload that image to the database. The user's selected image will be previewed in this modal.
 */
export default class ImageUploadModal extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	/**
	 * Handles the user making a selection in the file selection dialog
	 * @param {Object} event - the event representing the file selection interaction
	 */
	_selectImageToUpload = (event) => {
		const file = event.target.files[0];
		if (file && file.size <= MAX_UPLOAD_SIZE) {
			this.setState({
				loadingSelectedImage: true,
				selectedImageSize: null,
				selectedImage: null,
				selectedFileName: file.name
			});
			getFile(file).then((res) => {
				this.setState({
					selectedImage: res,
					selectedImageSize: file.size,
					loadingSelectedImage: false
				});
			});
		} else if (!this.state.selectedImage || (file && file.size > MAX_UPLOAD_SIZE)) {
			// don't overwrite any existing selected image
			this.setState({
				selectedImageSize: file && file.size,
				selectedImage: null,
				selectedFileName: file && file.name,
				loadingSelectedImage: false
			});
		}
	};

	/**
	 * Gets whether the large image size warnings should be rendered or not
	 * @return {boolean} - whether the large image size warnings should be rendered or not
	 */
	_shouldDisplaySizeWarning = () => {
		return Boolean(this.state.selectedImageSize && this.state.selectedImageSize > MAX_UPLOAD_SIZE);
	};
	
	/**
	 * Gets whether the upload image should be active or not
	 * @return {boolean} - whether the upload image should be active or not
	 */
	_canUpload = () => {
		return Boolean(this.state.selectedImage && this.state.selectedImageSize <= MAX_UPLOAD_SIZE);
	};
	
	/**
	 * Handles the user closing the modal without uploading the image
	 */
	_cancel = () => {
		this.setState({
			selectedImage: null,
			selectedImageSize: null,
			selectedFileName: null,
			loadingSelectedImage: false
		});
		this.props.onClose();
	};
	
	/**
	 * Handles the user selecting the upload button
	 */
	_confirmUpload = () => {
		this.props.onClose(this.state.selectedImage.split(";base64,")[1]);
		this.setState({
			selectedImage: null,
			selectedImageSize: null,
			selectedFileName: null,
			loadingSelectedImage: false
		});
	};
	
	render() {
		return (
		  <Modal
				show={this.props.visible}
				onHide={this._cancel}
			>
			<Modal.Header>
			  <Modal.Title>Upload Image</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{
					this._shouldDisplaySizeWarning() && (
						<Alert bsStyle="danger">
							That image is too large. The selected image should be no more than {Math.floor(bytesToMB(MAX_UPLOAD_SIZE))} megabytes.
						</Alert>
					)
				}
				<ImageSelectorComponent onSelect={this._selectImageToUpload} fileName={this.state.selectedFileName} />
				{
					this.state.selectedImage && (
						<div className="selectedImagePreview">
							<img className="img-responsive" alt="selected" src={this.state.selectedImage} />
						</div>
					)
				}
				{
					this.state.loadingSelectedImage && <LoaderComponent />
				}
			</Modal.Body>

			<Modal.Footer>
			  <Button onClick={this._cancel}>Cancel</Button>
			  <Button bsStyle="primary" onClick={this._confirmUpload} disabled={!this._canUpload()}>Upload</Button>
			</Modal.Footer>
		  </Modal>
		);
	}

}