import React from "react";
import ErrorIcon from "@material-ui/icons/Error";

import BaseAlertComponent from "./BaseAlertComponent";

/**
 * This component renders an error message to the user that will disappear after a few seconds
 */
export default class ErrorAlertComponent extends React.Component {

	render() {
		return (
			<BaseAlertComponent onClose={this.props.onClose}
								visible={this.props.visible}
								message={this.props.message}
								alertContentClassName="errorAlert"
								icon={<ErrorIcon className="alertIcon" />}
			/>
		);
	}
}
