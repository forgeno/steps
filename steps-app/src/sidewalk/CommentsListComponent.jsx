import React from "react";
import Reflux from "reflux";
import { Button, FormGroup, FormControl, Alert } from "react-bootstrap";
import Filter from "bad-words";
import swearsList from "bad-words/lib/lang";

import SidewalkStore from "./SidewalkStore";
import SidewalkActions from "./SidewalkActions";
import SidewalkCommentComponent from "./SidewalkCommentComponent";
import CommentDeletionModal from "./CommentDeletionModal";
import LoaderComponent from "../misc-components/LoaderComponent";

import {COMMENTS_PER_PAGE, COMMENT_ERROR_STATE, COMMENT_PROFANITY_MESSAGE, EMPTY_COMMENT_MESSAGE, PHONE_REGEX, SECONDARY_PHONE_REGEX} from "../constants/CommentConstants";

const filter = new Filter({ replaceRegex: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im, placeHolder: "*"});
filter.addWords('@');

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
			modalOpened: false,
			isLoadingComments: false,
			currentPage: 0,
			commentValidation: {
				state: COMMENT_ERROR_STATE,
				message: EMPTY_COMMENT_MESSAGE
			}
		};
	}
	
	/**
	 * Determines whether the current input text is valid or not
	 * @param {String} comment - the comment to validate
	 * @return {Object} - details about whether the input text is valid or not
	 * {
	 *		state: 	 a representation whether the current comment text can be posted or not ("error" or "success")
	 *		message: a reason why the comment can not be posted, if state is error
	 * }
	 */
	_validateCommentState = (comment) => {
		const length = comment.length;
		if (filter.isProfane(comment)) {
			return {
				state: COMMENT_ERROR_STATE,
				message: COMMENT_PROFANITY_MESSAGE
			};
		} else {
			if (comment.match(PHONE_REGEX)) {
				return {
					state: COMMENT_ERROR_STATE,
					message: `This comment contains a phone number: ${comment.match(PHONE_REGEX)[0]}`
				};
			} else if (comment.match(SECONDARY_PHONE_REGEX)) {
				return {
					state: COMMENT_ERROR_STATE,
					message: `This comment contains a phone number: ${comment.match(SECONDARY_PHONE_REGEX)[0]}`
				};
			}
		}

		if (length === 0) {
			return {
				state: COMMENT_ERROR_STATE,
				message: EMPTY_COMMENT_MESSAGE
			};
		} else if (length <= 300) {
			return {
				state: "success",
				message: ""
			};
		}
		return {
			state: COMMENT_ERROR_STATE,
			message: "Comments can be no more than 300 characters."
		};
	}

	/**
	 * Performs extra validation of the specified comment to make sure it does not have swears
	 * Separated from _validateCommentState() due to performance reasons
	 * @param {String} comment - the comment to validate
	 * @return {Object} - details about whether the input text is valid or not
	 * {
	 *		state: 	 a representation whether the current comment text can be posted or not ("error" or "success")
	 *		message: a reason why the comment can not be posted, if state is error
	 * }
	 */
	_validateSubstringSwears = (comment) => {
		for (const swear of swearsList.words) {
			if (swear === "hell" || swear.includes("as")) {
				continue;
			}
			if (comment.toLowerCase().includes(swear)) {
				return {
					state: COMMENT_ERROR_STATE,
					message: COMMENT_PROFANITY_MESSAGE
				};
			}
		}
		return {
			state: "success",
			message: ""
		};
	};
	
	_onCommentBlur = () => {
		const validation = this._validateSubstringSwears(this.state.enteredComment);
		if (validation.state === COMMENT_ERROR_STATE) {
			this.setState({
				commentValidation: validation
			});
		}
	};
	
	/**
	 * Handles the user changing their comment text value
	 */
	_handleChange = (e) => {
		this.setState({ 
			enteredComment: e.target.value,
			commentValidation: this._validateCommentState(e.target.value)
		});
	}

	/**
	 * Handles the user submitting their entered comment text
	 */
	_handleSubmit = () => {
		const validateComment = this._validateSubstringSwears(this.state.enteredComment);
		if (validateComment.state === COMMENT_ERROR_STATE) {
			this.setState({commentValidation: validateComment});
			return;
		}
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
	
	/**
	 * Gets whether the specified item is loaded
	 * @param {number} index - the index of the item in the list of all loaded items
	 * @return {boolean} - whether the specified item is loaded
	 */
	_isRowLoaded = ({index}) => {
		return Boolean(this.state.currentSidewalk.comments[index]);
	};
	
	/**
	 * Loads more items
	 * @param {number} startIndex - the starting index of new items to load
	 * @param {number} stopIndex - the ending index of new items to load
	 */
	_loadMoreRows = (startIndex, stopIndex) => {
		this.setState({
			isLoadingComments: true
		});
		SidewalkActions.loadComments(startIndex, stopIndex + 24, () => {
			this.setState({
				isLoadingComments: false
			});
		});
	};
	
	/**
	 * Gets all comments loaded on the current page
	 * @param {index} - the page index
	 * @return {Array<Object>} - a list of all comments on the page
	 */
	_getCommentsOnPage = (index) => {
		return this.state.currentSidewalk.comments.slice(index * COMMENTS_PER_PAGE, (index * COMMENTS_PER_PAGE) + COMMENTS_PER_PAGE)
	};
	
	/**
	 * Loads the previous comments page
	 */
	_visitPreviousPage = () => {
		this.setState({
			currentPage: this.state.currentPage - 1
		});
	};
	
	/**
	 * loads the next comments page
	 */
	_visitNextPage = () => {
		if (this._getCommentsOnPage(this.state.currentPage + 1).length === 0) {
			this._loadMoreRows(this.state.currentSidewalk.comments.length, this.state.currentSidewalk.comments.length + 25);
		}

		this.setState({
			currentPage: this.state.currentPage + 1
		});
	};
	
	renderCurrentCommentsPage() {
		const comments = this._getCommentsOnPage(this.state.currentPage);
		if (comments.length === 0 && this.state.hasNextCommentsPage) {
			return <LoaderComponent />;
		}

		return comments.map((details, index) => {
			return <SidewalkCommentComponent details={details} key={index} onDelete={this._openConfirmationModal} />
		});
	}
	
	render() {
		if (!this.state.currentSidewalk) {
			return null;
		}

		const comments = this.state.currentSidewalk.comments;
		return (
			<div className="comments">
				{
					this.state.commentValidation.message.length > 0 && (
						<Alert bsStyle="danger">
							{this.state.commentValidation.message}
						</Alert>
					)
				}
				<div className="commentBox">
						<FormGroup
							bsSize="small"
							controlId="formBasicText"
							validationState={this.state.commentValidation.state}
						>
							<FormControl
								componentClass="textarea"
								value={this.state.enteredComment}
								placeholder="Enter a comment"
								onChange={this._handleChange}
								onBlur={this._onCommentBlur}
								rows={4}
							/>
							<FormControl.Feedback />
						</FormGroup>
				</div>
				<Button bsStyle="primary" onClick={this._handleSubmit} disabled={this.state.uploadingComment || this.state.commentValidation.state === COMMENT_ERROR_STATE} >
					Submit
				</Button>
				{
					this.state.uploadingComment && (
						<div>
							Uploading...
							<LoaderComponent />
						</div>
					)
				}
				<hr />
				
				{
					this.state.currentPage > 0 && <span className="icon glyphicon glyphicon-arrow-left" onClick={this._visitPreviousPage} />
				}
				{
					(this.state.hasNextCommentsPage || this._getCommentsOnPage(this.state.currentPage + 1).length > 0) && <span className="nextIcon glyphicon glyphicon-arrow-right" onClick={this._visitNextPage} />
				}
				<div className="commentDisplaySection">
					{
						this.renderCurrentCommentsPage()
					}
				</div>

				<CommentDeletionModal comment={this.state.selectedComment}
									  sidewalkId={this.state.currentSidewalk.id}
									  onClose={this._closeConfirmationModal}
									  visible={this.state.modalOpened} />
			</div >

		);
	}
}