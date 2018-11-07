import Reflux from "reflux";

const Actions = Reflux.createActions([
	"deleteComment",
	"dismissCommentSuccessMessage",
	"dismissCommentErrorMessage",
	"checkCredentials",
	"deleteImage",
	"dismissImageSuccessMessage",
	"dismissImageErrorMessage",
	"dismissLoginSuccess", 
	"dismissLoginError",
	"getUnapprovedImages",
	"handlePendingImages"
]);

export default Actions;