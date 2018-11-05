import React from "react";
import Reflux from "reflux";

import Store from "../../admin/AdminStore";
import Actions from "../../admin/AdminActions";
import SuccessAlertComponent from "../../misc-components/SuccessAlertComponent";

/**
 * This component renders the error message that is displayed when an image deletion succeeds
 */
export default class ImageDeleteSuccessComponent extends Reflux.Component {

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
								 visible={this.state.successfullyDeletedImage}
								 message="The image has been successfully deleted."
			/>
		);
	}
}