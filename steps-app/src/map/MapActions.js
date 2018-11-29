import Reflux from "reflux";

const Actions = Reflux.createActions([
	"loadAllSidewalks",
	"loadMapDetails",
	"setDrawerOpened",
	"addFilter",
	"clearFilters",
	"filterMap",
	"updateSidewalkRatings",
	"selectSidewalk",
	"removeFilter"
]);

export default Actions;