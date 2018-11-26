import Reflux from "reflux";

const Actions = Reflux.createActions([
	"loadAllSidewalks",
	"loadMapDetails",
	"setDrawerOpened",
	"pushArray",
	"clearFilters",
	"filterMap",
	"updateSidewalkRatings",
	"selectSidewalk"
]);

export default Actions;