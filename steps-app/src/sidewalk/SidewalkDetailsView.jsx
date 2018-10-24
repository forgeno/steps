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

import Drawer from '@material-ui/core/Drawer';
import CloseIcon from "@material-ui/icons/Close";
import {Button} from "react-bootstrap";

/**
 * This component handles rendering details about a selected sidewalk
 */
export default class SidewalkDetailsView extends Component {

	constructor(props) {
		super(props);
		this.state = {
			modalOpened: false,
			viewingImages: false,
			showSidewalkDrawer: false,
			sidewalkDetails: null
		};
		this.store = Store;
	}

	componentDidMount() {
		Actions.getSidewalkDetails();
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

	/**
	 * handles closing of the drqawe
	 */
	handleClose = () => {
		this.props.handleDrawerInteraction(false);
	}

	renderAddressDetails() {
		return (
			<div className="streetNameSection">
				Address: {this.state.sidewalkDetails.address}
			</div>
		);
	}

	/**
	 * handles rendering image details
	 */
	renderImageDetails() {
		return (
			<div>
				<div className="drawerImageSection">
					<h1> Main Image place holder </h1>
				</div>
				<div className="streetNameSection">
					image gallery preview
				</div>
			</div>
		);
	}

	/**
	 * handles interactions and rendering the button for uploading images
	 */
	renderUploadImageComponent() {
		return (
			<div className="imageButtonDisplay">
				<UploadSidewalkImageComponent onClick={() => this.fileInput.click()}/>
					<div>
						<input
							type="file"
							accept="image/*"
							onChange={this.props.onSelect}
							className="uploadImageInput"
							ref={(fileInput) => {this.fileInput = fileInput;}}
						/>
					</div>
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
	
	/**
	 * handles rendering the ratings on the drawer
	 */
	renderRatings() {
		return (
			<div>
				<h3> Rating: N/A RATING </h3>
				<div className="drawerButtonDisplay">
					<div>
						<Button bsStyle="info">
							Rate Street
						</Button>
					</div>
					<div className="confirmButtonPadding">
					<Button bsStyle="info">
						Confirm
					</Button>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * handles showing the comments on the drawer
	 */

	renderComments() {
		return (
			<div>
				<h1>Comment Section</h1>
			</div>
		);
	}

	/**
	 * handles rendering the components on the drawer
	 */

	renderDrawerDetails() {
		if (!this.state.sidewalkDetails) {
			return null;
		}
		return (
			<div>
				{this.renderImageDetails()}
				{this.renderAddressDetails()}
				{this.renderUploadImageComponent()}
				{this.renderRatings()}
				{this.renderComments()}
			</div>
		)
	}

	render() {
		return (
			<Drawer open={this.props.mapClicked} anchor="right" variant="temporary">
				<CloseIcon onClick={this.handleClose} className="closeImageListButton"/>
				{this.renderDrawerDetails()}
			</Drawer>
		);
	}

}