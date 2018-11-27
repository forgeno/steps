import React from "react";
import Reflux from "reflux";

import Store from "../../admin/AdminStore";
import Actions from "../../admin/AdminActions";
import SuccessAlertComponent from "../../misc-components/SuccessAlertComponent";

/**
 * This component renders the error message that is displayed when a comment delete attempt succeeds
 */
export default class CommentDeleteSuccessComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissCommentSuccessMessage();
	};
	
	render() {
		return (
			<SuccessAlertComponent onClose={this._handleClose}
								 visible={this.state.successfullyDeletedComment}
								 message="The comment was successfully deleted."
			/>
		);
	}
}