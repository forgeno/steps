import React from "react";
import { Component } from 'reflux';
import SummaryMapView from "./SummaryMapView";
import SidewalkDetails from "../sidewalk/SidewalkDetailsView";

export default class MapDashboard extends Component {

	constructor(props) {
		super(props);
		// TODO: change to using the store instead
		this.state = {
			sidewalkOpened: true
		};
	}

	render() {
		return (
			<div>
				<SummaryMapView />
				{this.state.sidewalkOpened && <SidewalkDetails />}
			</div>
		);
	}

}