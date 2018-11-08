import React from "react";
import Reflux from "reflux";

import { Button, FormGroup, FormControl } from "react-bootstrap";

import SidewalkStore from "./SidewalkStore";
import SidewalkActions from "./SidewalkActions";
import SidewalkCommentComponent from "./SidewalkCommentComponent";
import CommentDeletionModal from "./CommentDeletionModal";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import DateUtilities from "../util/DateUtilities";




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
			commentHint: "Enter your comment here!",
			modalOpened: false
		};
	}
	
	/**
	 * Determines whether the current input text is valid or not
	 * @return {String} - a representation whether the current comment text can be posted or not ("error" or "success")
	 */
	_validateCommentState() {
		let Filter = require('bad-words'),
		// eslint-disable-next-line
		filter = new Filter({ replaceRegex: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im});
		filter.addWords('@','587','780')
		const length = this.state.enteredComment.length;
		if(filter.isProfane(this.state.enteredComment)){
			return "error";
		}
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
			enteredComment: "",
			commentHint: "Comment Successfully Updated!"
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
									type="textarea"
									value={this.state.enteredComment}
									placeholder={this.state.commentHint}
									onChange={this._handleChange}
								/>
								<FormControl.Feedback />
							</FormGroup>
						</form>
					</div>
					
					<Button bsStyle="primary" onClick={this._handleSubmit} disabled={this._validateCommentState() === "error"} >
						Submit
					</Button>
				</div>
				<br />
				
			
				
						<div className="commentDisplaySection">
				{/* <GridList cellHeight={160} className="gridList" cols={1}> */}
				<List className="displayList" >

					{comments.map((item, index) =>
						<div className="commentDisplayBox" key={index}>
							<h5>{item.text}</h5>
							<h6>{DateUtilities.formatDateForDisplay(new Date(item.date))}</h6>
						</div>
					)}
				
				</List>
				</div>


						

				
				
				<CommentDeletionModal comment={this.state.selectedComment}
									  sidewalkId={this.state.currentSidewalk.id}
									  onClose={this._closeConfirmationModal}
									  visible={this.state.modalOpened} />
			</div >

		);
	}
}