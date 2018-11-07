import React from "react";
import { Component } from 'reflux';
import esriLoader from "esri-loader";

import Actions from "./MapActions";
import Store from "./MapStore";

import {esriURL} from "../constants/ArcGISConstants";
import RestUtil from "../util/RestUtil";

export default class SummaryMapView extends Component {

	constructor() {
		super();
		this.store = Store;
	}

  	componentDidMount() {
		this.load();
	}

	load() {
		Promise.all([esriLoader.loadModules(['esri/Map', 'esri/views/MapView'], esriURL), esriLoader.loadModules(["esri/layers/FeatureLayer", "esri/PopupTemplate", "esri/geometry/Circle", "esri/Graphic","esri/core/watchUtils","esri/renderers/UniqueValueRenderer","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol","esri/layers/support/MapImage", "esri/widgets/Legend", "esri/widgets/Search"], esriURL)]).then((data) => {
				Actions.display(data[0][0],data[0][1],data[1][0], data[1][1], data[1][2], data[1][3],data[1][4],data[1][5],data[1][6],data[1][7],data[1][8], data[1][9], data[1][10]);
			});
	}
	
	render() {
		return (
			<div id="mapContainer"/>
		);
	}
}
