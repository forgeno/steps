import React from "react";
import Reflux from "reflux";
import { Button, FormGroup, FormControl } from "react-bootstrap";

import SidewalkStore from "./SidewalkStore";
import SidewalkActions from "./SidewalkActions";
import SidewalkCommentComponent from "./SidewalkCommentComponent";
import CommentDeletionModal from "./CommentDeletionModal";

/**
 * This class renders the list of all comments left on a sidewalk, as well as the form for
 * posting new comments
 */
export default class CommentsListComponent extends Reflux.Component {

	constructor() {
		super();
		this.store = SidewalkStore;
		this.state = {
			enteredComment: "",
			modalOpened: false
		};
	}
	
	/**
	 * Determines whether the current input text is valid or not
	 * @return {boolean} - whether the current comment text can be posted or not
	 */
	_validateCommentState() {
		const length = this.state.enteredComment.length;
		if (length === 0) {
			return "error";
		} else if (length <= 300) {
			return "success";
		}
		return "error";
	}

	/**
	 * Handles the user changing their comment text value
	 */
	_handleChange = (e) => {
		this.setState({ 
			enteredComment: e.target.value 
		});
	}

	/**
	 * Handles the user submitting their entered comment text
	 */
	_handleSubmit = (e) => {
		SidewalkActions.uploadComment(this.state.enteredComment);
		this.setState({
			enteredComment: ""
		});
	}
	
	_openConfirmationModal = (selectedComment) => {
		this.setState({
			modalOpened: true,
			selectedComment: selectedComment
		});
	};
	
	_closeConfirmationModal = (deleted) => {
		if (deleted) {
			SidewalkActions.removeLoadedComment(this.state.selectedComment);
		}
		this.setState({
			modalOpened: false,
			selectedComment: null
		});
	};
	
	render() {
		if (!this.state.currentSidewalk) {
			return null;
		}

		const comments = this.state.currentSidewalk.comments;
		return (
			<div className="comments">
				<div className="commentBox">
						<FormGroup
							bsSize="small"
							controlId="formBasicText"
							validationState={this._validateCommentState()}
						>
							<FormControl
								componentClass="textarea"
								value={this.state.enteredComment}
								placeholder="Enter a comment"
								onChange={this._handleChange}
								rows={4}
							/>
							<FormControl.Feedback />
						</FormGroup>
				</div>
				<Button bsStyle="primary" onClick={this._handleSubmit} disabled={this._validateCommentState() === "error"} >
					Submit
				</Button>
				<hr />

				<div className="commentDisplaySection">
					{comments.map((details, index) =>
						<SidewalkCommentComponent details={details} key={index} onDelete={this._openConfirmationModal} />
					)}
				</div>
				<CommentDeletionModal comment={this.state.selectedComment}
									  sidewalkId={this.state.currentSidewalk.id}
									  onClose={this._closeConfirmationModal}
									  visible={this.state.modalOpened} />
			</div >

		);
	}
}