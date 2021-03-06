import React from "react";
import Reflux from "reflux";

import Store from "../SidewalkStore";
import Actions from "../SidewalkActions";
import ErrorAlertComponent from "../../misc-components/ErrorAlertComponent";
/**
 * This component renders the error message that is displayed when attempt comment failed
 */
export default class PostCommentingThirtySidewalk extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissCommentSuspendThirty();
	};

	render() {
		return (
			<ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.thirtyCommentSuspend}
								 message="You can comment at most 3 times in 30 seconds."
			/>
		);
	}
}
