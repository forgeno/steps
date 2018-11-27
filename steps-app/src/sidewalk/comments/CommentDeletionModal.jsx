import React from "react";
import Reflux from "reflux";

import LoaderComponent from "../../misc-components/LoaderComponent";
import ConfirmationModal from "../../misc-components/ConfirmationModal";

import Store from "../../admin/AdminStore";
import Actions from "../../admin/AdminActions";

/**
 * This component renders a modal that allows an administrator to delete a user's comment on a sidewalk
 */
export default class CommentDeletionModal extends Reflux.Component {

	constructor(props) {
		super(props);
		this.store = Store;
		this.state = {};
	}

	/**
	 * Handles the user closing the modal
	 */
	_cancel = () => {
		this.props.onClose();
	};
	
	/**
	 * Handles the user selecting the confirm button
	 */
	_confirm = () => {
		Actions.deleteComment(this.props.sidewalkId, this.props.comment.id, (success) => {
			if (success) {
				this.props.onClose(true);
			}
		});
	};
	
	renderModalBody() {
		if (!this.props.visible) {
			return null;
		}
		return (
			<div>
				<p className="wrapText">{this.props.comment.text}</p>
				{
					this.state.isDeletingComment && <LoaderComponent />
				}
			</div>
		)
	}
	
	render() {
		return (
			<ConfirmationModal title="Are you sure you want to delete this comment?"
							   body={this.renderModalBody()}
							   onCancel={this._cancel}
							   onConfirm={this._confirm}
							   visible={this.props.visible}
							   disabledConfirm={this.state.isDeletingComment}
		    />
		)
	}

}
