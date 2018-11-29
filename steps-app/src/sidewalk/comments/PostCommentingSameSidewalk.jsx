import React from "react";
import Reflux from "reflux";

import Store from "../SidewalkStore";
import Actions from "../SidewalkActions";
import ErrorAlertComponent from "../../misc-components/ErrorAlertComponent";

/**
 * This component renders the error message that is displayed when a comment post attempt fails
 */
export default class PostCommentingSameSidewalk extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissSuspendSidewalkComment();
	};

	render() {
		return (
			<ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.commentOneSidewalk}
								 message="You can't comment on the same sidewalk more than 3 times a day."
			/>
		);
	}
}
