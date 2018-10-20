import React from "react";
import { Component } from 'reflux';
import Actions from "./LoadMapActions";
import Store from "./SummaryMapStore";
import esriLoader from "esri-loader";
import {esriURL, layerURL} from "../constants/ArcGISConstants";

export default class SummaryMapView extends Component {

	constructor() {
		super();
		this.state = {}
		this.store = Store;
  }

  	componentDidMount() {
		this.load();
	  }

	display(Map, MapView, FeatureLayer, PopupTemplate) {
	
		const map = new Map({
			basemap: "osm"
		});
	
		const view = new MapView({
			map: map,
			container: "mapContainer",
			basemap: 'osm',
			center: [-113.4990, 53.5405],
			zoom: 15
		});
		
		const featureLayer = new FeatureLayer({
			url: layerURL
		});

		map.add(featureLayer);


		view.on("click",() => {
			featureLayer.popupTemplate = {
				content: "Unique ID: {osm_id}"
			}
		})

		this.setState({
			map,
			view });
	
	}

	load() {
		Promise.all([esriLoader.loadModules(['esri/Map', 'esri/views/MapView'], esriURL), esriLoader.loadModules(["esri/layers/FeatureLayer", "esri/PopupTemplate"], esriURL)]).then((data) => {
			this.display(data[0][0],data[0][1],data[1][0],data[1][1])
		})
	}
	render() {
		return (
			<div id="mapContainer"/>
		);
	}
}