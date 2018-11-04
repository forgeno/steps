import Reflux from "reflux";

const Actions = Reflux.createActions([
	"deleteComment",
	"dismissCommentSuccessMessage",
	"dismissCommentErrorMessage"
]);

export default Actions;