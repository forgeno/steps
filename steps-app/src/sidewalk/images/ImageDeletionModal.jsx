import React from "react";
import Reflux from "reflux";

import LoaderComponent from "../../misc-components/LoaderComponent";
import ConfirmationModal from "../../misc-components/ConfirmationModal";

import Store from "../../admin/AdminStore";
import Actions from "../../admin/AdminActions";

/**
 * This component renders a modal that allows an administrator to delete a user's image on a sidewalk
 */
export default class ImageDeletionModal extends Reflux.Component {

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
		Actions.deleteImage(this.props.sidewalkId, this.props.image.id, (success) => {
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
				{
					this.state.isDeletingImage && <LoaderComponent />
				}
				<div className="selectedImagePreview">
					<img className="img-responsive"
						alt="selected"
						src={this.props.image.url} />
				</div>
				
			</div>
		)
	}
	
	render() {
		return (
			<ConfirmationModal title="Are you sure you want to delete this image?"
							   body={this.renderModalBody()}
							   onCancel={this._cancel}
							   onConfirm={this._confirm}
							   visible={this.props.visible}
							   disabledConfirm={this.state.isDeletingImage}
		    />
		)
	}

}
