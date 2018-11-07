import Reflux from "reflux";

const Actions = Reflux.createActions([
	"deleteComment",
	"dismissCommentSuccessMessage",
	"dismissCommentErrorMessage",
	"deleteImage",
	"dismissImageSuccessMessage",
	"dismissImageErrorMessage",
	"getUnapprovedImages",
	"handlePendingImages"
]);

export default Actions;