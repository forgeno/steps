import React from "react";
import Reflux from "reflux";

import Store from "../SidewalkStore";
import Actions from "../SidewalkActions";
import SuccessAlertComponent from "../../misc-components/SuccessAlertComponent";

/**
 * This component renders the error message that is displayed when an image upload succeeds
 */
export default class UploadedImageSuccessComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissImageSuccessMessage();
	};
	
	render() {
		return (
			<SuccessAlertComponent onClose={this._handleClose}
								 visible={this.state.uploadImageSucceeded}
								 message="Your image was uploaded. It must be approved before it is visible."
			/>
		);
	}
}