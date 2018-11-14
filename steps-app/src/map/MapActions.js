import Reflux from "reflux";

const Actions = Reflux.createActions([
	"loadAllSidewalks",
	"loadMapDetails",
	"setDrawerOpened",
	"updateSidewalkRatings",
	"selectSidewalk"
]);

export default Actions;