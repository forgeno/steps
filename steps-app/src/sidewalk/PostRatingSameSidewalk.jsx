import React from "react";
import Reflux from "reflux";

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";
import ErrorAlertComponent from "../misc-components/ErrorAlertComponent";

/**
 * This component renders the error message that is displayed when the user posts too many ratings to the same sidewalk
 * in a short amount of time
 */
export default class PostRatingSameSidewalk extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissSuspendSidewalk();
	};
	
	render() {
		return (
			<ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.sameSidewalkRatingError}
								 message="You can only rate the same sidewalk once per hour."
			/>
		);
	}
}
