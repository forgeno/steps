import React from "react";
import { Component } from 'reflux';
import SummaryMapView from "./SummaryMapView";
import SidewalkDetailsView from "../sidewalk/SidewalkDetailsView";
import Store from "./SummaryMapStore";

export default class MapDashboard extends Component {

	constructor(props) {
		super(props);
		// TODO: change to using the store instead
		this.state = {
			sidewalkOpened: true
		};
		this.store = Store;
	}

	handleDrawerInteraction = (opened) => {
		this.setState({
			mapClicked: opened
		});
	}

	render() {
		return (
			<div>
				<SummaryMapView/>
				{this.state.sidewalkOpened && <SidewalkDetailsView  mapClicked={this.state.mapClicked} handleDrawerInteraction={this.handleDrawerInteraction}/>}
			</div>
		);
	}

}