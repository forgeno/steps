import React from "react";
import { Component } from 'reflux';
import Actions from "./LoadMapActions";
import Store from "./SummaryMapStore";
import esriLoader from "esri-loader";
import {esriURL} from "../constants/ArcGISConstants";

export default class SummaryMapView extends Component {

	constructor() {
		super();
		this.state = {}
		this.store = Store;
  }

  	componentDidMount() {
		this.loadOSMBaseMap();
	  }

	loadOSMBaseMap() {
		esriLoader.loadModules(['esri/Map', 'esri/views/MapView'], esriURL).then((Actions.displayOSMBaseMap))
				.catch(err => {
				console.error(err);
			});
		}

	render() {
		return (
			<div id="mapContainer"/>
		);
	}
}
