import React from "react";
import Reflux from "reflux";
import { Button, FormGroup, ControlLabel, FormControl } from "react-bootstrap";

import SidewalkStore from "./SidewalkStore";
import SidewalkActions from "./SidewalkActions";
import DateUtilities from "../util/DateUtilities";

export default class CommentsListComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = SidewalkStore;
		this.state = {
			enteredComment: ""
		};
	}
	
	_validateCommentState() {
		const length = this.state.enteredComment.length;
		if (length === 0) {
			return "error";
		} else if (length <= 300) {
			return "success";
		}
		return "error";
	}

	_handleChange = (e) => {
		this.setState({ 
			enteredComment: e.target.value 
		});
	}

	_handleSubmit = (e) => {
		SidewalkActions.uploadComment(this.state.enteredComment);
		this.setState({
			enteredComment: ""
		});
	}
	
	render() {
		if (!this.state.currentSidewalk) {
			return null;
		}
		const comments = this.state.currentSidewalk.comments;

		return (
			<div>
				<div className="commentUploadSection">
					<div className="commentBox">
						<form>
							<FormGroup
								bsSize="small"
								controlId="formBasicText"
								validationState={this._validateCommentState()}
							>
								<FormControl
									type="text"
									value={this.state.enteredComment}
									placeholder="Enter a comment"
									onChange={this._handleChange}
								/>
								<FormControl.Feedback />
							</FormGroup>
						</form>
					</div>
					<div className="submitCommentButton">
						<Button bsStyle="primary" onClick={this._handleSubmit} disabled={this._validateCommentState() === "error"} >
							Submit
						</Button>
					</div>
				</div>
				<br />

				<div className="commentDisplaySection">
					{comments.map((item, index) =>
						<div className="commentDisplayBox" key={index}>
							<h5>{item.text}</h5>
							<h6>{DateUtilities.formatDateForDisplay(new Date(item.date))}</h6>
						</div>
					)}
				</div>
			</div >

		);
	}
}