import Reflux from "reflux";

import Actions from "./SummaryStatisticsActions";
import RestUtil from "../util/RestUtil";

/**
 * This store keeps track of the state of components that render information related to sidewalk summary statistics
 */
export default class SummaryStatisticsStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {};
		this.listenables = Actions;
		
		if (process.env.NODE_ENV === "development"){
			window.DEV_STATISTICS_STORE = this;
		}
	}

	onLoadSummaryStatistics() {
		this.setState({
			isLoading: true
		});
		RestUtil.sendGetRequest("sidewalk/summary").then((res) => {
			res.isLoading = false;
			res.contributionsByMonth.sort((a, b) => {
				const aSplit = a.monthYear.split("/"),
					aMonth = parseInt(aSplit[0]),
					aYear = parseInt(aSplit[1]);
				const bSplit = b.monthYear.split("/"),
					bMonth = parseInt(bSplit[0]),
					bYear = parseInt(bSplit[1]);
				if (aYear === bYear) {
					return aMonth - bMonth;
				}
				return aYear - bYear;
			});
			this.setState(res);
		}).catch((err) => {
			this.setState({
				isLoading: false
			});
			console.error(err);
		});
	}
	
	onLoadSidewalkContributionsSummary() {
		RestUtil.sendGetRequest("sidewalk").then((res) => {
			this.setState({
				sidewalks: res
			});
		}).catch((err) => {
			console.error(err);
		});
	}
}
