import React from "react";
import Reflux from "reflux";

import Store from "./SummaryStatisticsStore";
import Actions from "./SummaryStatisticsActions";

export default class SummaryStatisticsView extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
		this.state = {};
	}

	componentDidMount() {
		Actions.loadSummaryStatistics();
	}
	
	render() {
		if (this.state.isLoading) {
			return null;
		}
		
		return (
			<div data-summary-stats>
				<p>Summary Statistics</p>
			</div>
		)
	}
}