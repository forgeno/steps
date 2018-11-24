import React from "react";
import { Component } from 'reflux';

import Actions from "./MapActions";
import Store from "./MapStore";

export default class SummaryMapView extends Component {

	constructor() {
		super();
		this.store = Store;
	}

  	componentDidMount() {
		Actions.loadMapDetails();
	}
	
	render() {
		return (
			<div id="mapContainer">
			<div id="BasemapToggle"/>
			</div>
		);
	}
}
