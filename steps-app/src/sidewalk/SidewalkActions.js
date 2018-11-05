import Reflux from "reflux";

const Actions = Reflux.createActions([
	"uploadSidewalkImage",
	"loadUploadedImages",
	"loadSidewalkDetails",
	"uploadComment",
	"dismissImageErrorMessage",
	"dismissImageSuccessMessage",
	"removeLoadedComment",
	"removeLoadedImage"
]);

export default Actions;