import React from "react";
import Reflux from "reflux";

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";
import ErrorAlertComponent from "../misc-components/ErrorAlertComponent";

/**
 * This component renders the error message that is displayed when the user posts too many ratings within 30 seconds
 */
export default class PostRatingThirtyComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissRateSuspendThirty();
	};
	
	render() {
		return (
			<ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.thirtySecondRatingError}
								 message="You have rated too many sidewalks within 30 seconds."
			/>
		);
	}
}
