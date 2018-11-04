import React from "react";
import {Modal, Button} from "react-bootstrap";

import MaterialModal from '@material-ui/core/Modal';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  paper: {
    width: "50%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
	margin: "auto",
	position: "relative",
	top: "50%",
	transform: "translateY(-50%)"
  },
});

/**
 * This component renders a modal that allows the user to select an image from their local files,
 * and then upload that image to the database. The user's selected image will be previewed in this modal.
 */
class ConfirmationModal extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	/**
	 * Handles the user closing the modal
	 */
	_cancel = () => {
		this.props.onCancel();
	};
	
	/**
	 * Handles the user selecting the confirm button
	 */
	_confirm = () => {
		this.props.onConfirm();
	};
	
	render() {
		const { classes } = this.props;
		return (
			<MaterialModal
			  open={this.props.visible}
			  onClose={this._cancel}
			>
				<div className={classes.paper}>
					<Modal.Header>
						<Modal.Title>{this.props.title}</Modal.Title>
					</Modal.Header>
					<div className="marginUpDown15">
						{
							this.props.body
						}
					</div>
					<Modal.Footer>
						<Button onClick={this._cancel}>Cancel</Button>
						<Button bsStyle="primary" onClick={this._confirm} disabled={this.props.disabledConfirm}>Confirm</Button>
					</Modal.Footer>
				</div>
			</MaterialModal>
		)
	}

}

export default withStyles(styles)(ConfirmationModal)