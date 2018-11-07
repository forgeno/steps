import { Selector } from 'testcafe';

export default class SidewalkDrawer {
	
    constructor() {
		this.drawer = Selector(".sidewalkDrawer", {timeout: 40000});
		this.addressName = Selector(".streetNameSection");
		this.sectionHeaders = Selector(".sidewalkDrawer *[data-sidewalk-header]", {timeout: 40000});
		
		// comments
		this.commentsHeader = this.sectionHeaders.withText("Comments", {timeout: 30000});
		this.commentInput = Selector(".comments .commentBox textarea");
		this.submitComment = Selector(".comments button");
		this.comments = Selector(".commentDisplaySection h5");
		
		// images
		this.imagesHeader = this.sectionHeaders.withText("Images", {timeout: 30000});
		this.uploadImagesButton = Selector(".uploadSidewalkImageText").parent();
		this.previewImagesButton = Selector(".previewSidewalkImages .btn");
    }
	
	/**
	 * Gets the comment with the specified text
	 * @return {Selector?} - the comment with the specified text if it exists, null otherwise
	 */
	getCommentWithText(text) {
		return this.comments.withText(text);
	}
	
	/**
	 * Gets the date of the comment with the specified text
	 * @return {Selector?} - the comment with the specified text if it exists, null otherwise
	 */
	getCommentDateByText(text) {
		return this.comments.withText(text).parent().find("h6");
	}
	
	/**
	 * Gets the number of comments displayed on the screen
	 * @return {number} - the number of comments displayed on the screen
	 */
	getCommentsCount() {
		return this.comments.count;
	}
	
	/**
	 * Gets the delete button for the comment with the specified text
	 * @return {Selector?} - the delete button of the comment with the specified text if it exists, null otherwise
	 */
	getDeleteCommentButton(text) {
		return this.comments.withText(text).parent().find(".closeButton");
	}
}

