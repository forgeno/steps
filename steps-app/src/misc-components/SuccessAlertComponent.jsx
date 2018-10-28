import React from "react";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import BaseAlertComponent from "./BaseAlertComponent";

/**
 * This component renders a successful action message to the user that will disappear after a few seconds
 */
export default class SuccessAlertComponent extends React.Component {

	render() {
		return (
			<BaseAlertComponent onClose={this.props.onClose}
								visible={this.props.visible}
								message={this.props.message}
								alertContentClassName="successAlert"
								icon={<CheckCircleIcon className="alertIcon" />}
			/>
		);
	}
}
