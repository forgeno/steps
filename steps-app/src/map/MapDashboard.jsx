import React from "react";
import { Component } from 'reflux';
import SummaryMapView from "./SummaryMapView";
import SidewalkDetailsView from "../sidewalk/SidewalkDetailsView";

import MapStore from "./MapStore";
import MapActions from "./MapActions";

export default class MapDashboard extends Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.store = MapStore;
	}

	componentDidMount() {
		if (!this.state.sidewalks || this.state.sidewalks.length === 0) {
			MapActions.loadAllSidewalks();
		}
	}
	
	_onClose = () => {
		MapActions.setDrawerOpened(false);
	};
	
	render() {
		return (
			<div>
				<SummaryMapView />
				<SidewalkDetailsView visible={this.state.sidewalkSelected} onClose={this._onClose} selectedSidewalkDetails={this.state.selectedSidewalkDetails} />
			</div>
		);
	}

}