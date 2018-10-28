import React from "react";
import Reflux from "reflux";

import Store from "../SidewalkStore";
import Actions from "../SidewalkActions";
import ErrorAlertComponent from "../../misc-components/ErrorAlertComponent";

/**
 * This component renders the error message that is displayed when an image upload fails
 */
export default class UploadedImageErrorComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissImageErrorMessage();
	};
	
	render() {
		return (
			<ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.uploadedImageError}
								 message="An error occurred while uploading the image."
			/>
		);
	}
}
