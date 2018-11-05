import React from "react";
import Reflux from "reflux";

import Store from "../../admin/AdminStore";
import Actions from "../../admin/AdminActions";
import ErrorAlertComponent from "../../misc-components/ErrorAlertComponent";

/**
 * This component renders the error message that is displayed when an image deletion fails
 */
export default class ImageDeleteErrorComponent extends Reflux.Component {

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
								 visible={this.state.failedDeleteImage}
								 message="An error occurred while deleting the image."
			/>
		);
	}
}
