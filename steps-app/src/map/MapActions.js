import Reflux from "reflux";

const Actions = Reflux.createActions([
	"loadAllSidewalks",
	"loadMapDetails",
	"setDrawerOpened",
	"updateSidewalkRatings",
	"displaySearch",
	"dismissSearch",
	"selectSidewalk"
]);

export default Actions;