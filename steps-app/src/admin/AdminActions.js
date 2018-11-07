import Reflux from "reflux";

const Actions = Reflux.createActions([
	"deleteComment",
	"dismissCommentSuccessMessage",
	"dismissCommentErrorMessage",
	"deleteImage",
	"dismissImageSuccessMessage",
	"dismissImageErrorMessage"
]);

export default Actions;