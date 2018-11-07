import React from "react";
import Reflux from "reflux";
import Card from "@material-ui/core/Card";
import CloseIcon from "@material-ui/icons/Close";

import DateUtilities from "../util/DateUtilities";
import Store from "../admin/AdminStore";

/**
 * This class renders details about a comment left on a sidewalk
 */
export default class SidewalkCommentComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
		this.state = {};
	}

	_handleDelete = () => {
		this.props.onDelete(this.props.details);
	};
	
	render() {
		return (
			<Card className="commentDisplayBox">
				{
					this.state.isLoggedIn && (
						<CloseIcon onClick={this._handleDelete} className="closeButton" />
					)
				}
				<h5>{this.props.details.text}</h5>
				<h6>{DateUtilities.formatDateForDisplay(new Date(this.props.details.date))}</h6>
			</Card>
		)
	}
}