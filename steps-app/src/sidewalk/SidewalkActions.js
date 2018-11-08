import Reflux from "reflux";

const Actions = Reflux.createActions([
	"uploadSidewalkImage",
	"loadUploadedImages",
	"loadSidewalkDetails",
	"uploadComment",
	"dismissImageErrorMessage",
	"dismissImageSuccessMessage",
	"uploadRatings",
	"removeLoadedComment",
	"removeLoadedImage"
]);

export default Actions;