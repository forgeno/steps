import React from "react";

import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

/**
 * This component renders a temporary message to the user that will disappear after a few seconds
 */
export default class BaseAlertComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {}
	}

	/**
	 * Handles the component being closed
	 */
	_handleClose = () => {
		this.props.onClose();
	};
	
	render() {
		return (
			<Snackbar
			  anchorOrigin={{
				vertical: "bottom",
				horizontal: "left",
			  }}
			  open={this.props.visible}
			  autoHideDuration={4000}
			  onClose={this._handleClose}
			>
				<SnackbarContent
				  className={this.props.alertContentClassName}
				  aria-describedby="client-snackbar"
				  message={
					<span id="client-snackbar" className="alertBody">
						{this.props.icon}
					  <span className="alertMessage">
						  {this.props.message}
					  </span>
					</span>
				  }
				  action={[
					<IconButton
					  key="close"
					  aria-label="Close"
					  color="inherit"
					  onClick={this._handleClose}
					>
					  <CloseIcon />
					</IconButton>,
				  ]}
				/>
			</Snackbar>
		)
	}
}
