import Reflux from "reflux";

const Actions = Reflux.createActions([
	"deleteComment",
	"dismissCommentSuccessMessage",
	"dismissCommentErrorMessage",
	"checkCredentials",
	"logoutAdmin",
	"deleteImage",
	"dismissImageSuccessMessage",
	"dismissImageErrorMessage",
	"dismissLoginSuccess", 
	"dismissLoginError",
	"getUnapprovedImages",
	"handlePendingImages",
	"dismissImageApprovalNotification",
	"dismissImageRejectionNotification"
]);

export default Actions;