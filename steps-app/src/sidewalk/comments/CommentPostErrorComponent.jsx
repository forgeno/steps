import React from "react";
import Reflux from "reflux";

import Store from "../SidewalkStore";
import Actions from "../SidewalkActions";
import ErrorAlertComponent from "../../misc-components/ErrorAlertComponent";

/**
 * This component renders the error message that is displayed when a comment post attempt fails
 */
export default class CommentPostErrorComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		Actions.dismissCommentErrorMessage();
	};
	
	render() {
		return (
			<ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.uploadCommentFailed}
								 message="An error occurred while posting the comment."
			/>
		);
	}
}
