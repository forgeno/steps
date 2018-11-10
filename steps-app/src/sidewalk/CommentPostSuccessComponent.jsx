import React from "react";
import Reflux from "reflux";

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";
import SuccessAlertComponent from "../misc-components/SuccessAlertComponent";

/**
 * This component renders the error message that is displayed when a comment post attempt succeeds
 */
export default class CommentPostSuccessComponent extends Reflux.Component {

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
								 visible={this.state.uploadCommentSucceeded}
								 message="Your comment was successfully posted."
			/>
		);
	}
}