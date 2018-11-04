import Reflux from "reflux";

const Actions = Reflux.createActions([
	"uploadSidewalkImage",
	"loadUploadedImages",
	"loadSidewalkDetails",
	"uploadComment",
	"dismissImageErrorMessage",
	"dismissImageSuccessMessage",
	"removeLoadedComment"
]);

export default Actions;