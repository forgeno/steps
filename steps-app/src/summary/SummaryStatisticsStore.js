import Reflux from "reflux";

import Actions from "./SummaryStatisticsActions";
import RestUtil from "../util/RestUtil";

/**
 * This store keeps track of the state of components that render information related to sidewalk summary statistics
 */
export default class SummaryStatisticsStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {
			totalSidewalks: 0,
			totalReviews: 0,
			totalComments: 0,
			averageReviews: {},
			totalImagesUploaded: 0,
			contributionsByMonth: [],
			isLoading: false
		};
		this.listenables = Actions;
	}

	onLoadSummaryStatistics() {
		this.setState({
			isLoading: true
		});
		// TODO: set correct endpoint
		RestUtil.sendGetRequest("sidewalk/2").then((res) => {
			res.isLoading = false;
			this.setState(...res);
		}).catch((err) => {
			this.setState({
				isLoading: false
			});
			console.error(err);
		});
	}
	
}
