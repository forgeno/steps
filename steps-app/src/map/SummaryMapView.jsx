import React from "react";
import { Component } from 'reflux';
import esriLoader from "esri-loader";

import Actions from "./MapActions";
import Store from "./MapStore";

import {esriURL} from "../constants/ArcGISConstants";

export default class SummaryMapView extends Component {

	constructor() {
		super();
		this.store = Store;
	}

  	componentDidMount() {
		this.load();
	}

	load() {
		Promise.all([esriLoader.loadModules(['esri/Map', 'esri/views/MapView'], esriURL), esriLoader.loadModules(["esri/layers/FeatureLayer", "esri/PopupTemplate"], esriURL)]).then((data) => {
			Actions.display(data[0][0],data[0][1],data[1][0],data[1][1]);
		});
	}
	
	render() {
		return (
			<div id="mapContainer"/>
		);
	}
}
