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
	"removeLoadedImage",
	"dismissCommentSuccessMessage",
	"dismissCommentErrorMessage",
	"loadComments",
	"dismissRatingsSuccessMessage",
	"dismissRatingsFailureMessage",
	"getSidewalkRatings",
	"suspendedSidewalk",
	"rateSuspendThirty",
	"dismissSuspendSidewalk",
	"dismissRateSuspendThirty",
	"downloadSidewalkCSV",
	"suspendedSidewalkComment",
	"dismissSuspendSidewalkComment",
	"commentSuspendThirty",
	"dismissCommentSuspendThirty"
]);

export default Actions;