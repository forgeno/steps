import React from "react";
import Reflux from "reflux";

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";
import SuccessAlertComponent from "../misc-components/SuccessAlertComponent";

/**
 * This component renders the error message that is displayed when a rating post attempt succeeds
 */
export default class PostRatingSuccessComonent extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissRatingsSuccessMessage();
	};
	
	render() {
		return (
			<SuccessAlertComponent onClose={this._handleClose}
								 visible={this.state.successfullyUploadedRatings}
								 message="Your rating was successfully posted."
			/>
		);
	}
}