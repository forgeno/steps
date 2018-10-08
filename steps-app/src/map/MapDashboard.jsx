import React from "react";
import { Component } from 'reflux';
import SummaryMapView from "./SummaryMapView";

export default class MapDashboard extends Component {

	render() {
		return (
			<div>
				<SummaryMapView />
			</div>
		);
	}

}