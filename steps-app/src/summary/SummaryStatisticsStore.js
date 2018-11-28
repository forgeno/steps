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
		Promise.all([RestUtil.sendGetRequest("sidewalk/summary"), RestUtil.sendGetRequest(`sidewalk/completeSummary`)])
			.then((res) => {
				const allSidewalkObjects = res[1];
				res = res[0];
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
				
				const allSidewalkArray = [];
				allSidewalkArray.push(['SidewalkId', 'AccessibilityRating', 'Comfort', 'Connectivity', 'SenseOfSecurity', 'PhysicalSafety', 'OverallRating', 'TotalRatings', 'TotalComments', 'TotalImages']);
				allSidewalkObjects.sidewalks.forEach((sidewalk) => {
					const data = [sidewalk.id, sidewalk.accessibility, sidewalk.comfort, sidewalk.connectivity, sidewalk.senseOfSecurity, sidewalk.physicalSafety, sidewalk.overallRating, sidewalk.ratings, sidewalk.comments, sidewalk.images];
					allSidewalkArray.push(data);
				});
				res.sidewalkCSVInfo = allSidewalkObjects;
				res.csvFormatted = allSidewalkArray;
				res.hasCSVData = true;
				this.setState(res);
			}).catch((err) => {
				this.setState({
					isLoading: false
				});
				console.error(err);
			});
	}
	
}
