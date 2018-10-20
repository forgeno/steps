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
		esriLoader.loadModules([ 'esri/Map', 
		'esri/views/MapView', 
		"esri/layers/FeatureLayer", 
		"esri/layers/CSVLayer", 
		"esri/Color",
		"esri/symbols/SimpleMarkerSymbol", 
		"esri/renderers/SimpleRenderer"], esriURL).then(([Map, MapView, FeatureLayer, CSVLayer, Color, SimpleMarkerSymbol, SimpleRenderer]) => {
				let map = new Map({
					basemap: "osm"
				});

				const featureLayer = new FeatureLayer({
				 	url: "https://services9.arcgis.com/8ccGcFm2KpUhl0DB/arcgis/rest/services/edm_network_walkability/FeatureServer"
				});

				 map.add(featureLayer);
			
				const csvLayer = new CSVLayer({
					url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.csv"
				});
				   //var orangeRed = new Color([238, 69, 0, 0.5]); // hex is #ff4500
				   //var marker = new SimpleMarkerSymbol("solid", 15, null, orangeRed);
				   //var renderer = new SimpleRenderer(marker);
				   //csvLayer.setRenderer(renderer);
				   csvLayer.renderer = {
					type: "simple",  // autocasts as new SimpleRenderer()
					symbol: {
					  type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
					  size: 2,
					  color: "red",
					  outline: {  // autocasts as new SimpleLineSymbol()
						width: 0.5,
						color: "white"
					  }
					}
				};
				 map.add(csvLayer);

				let view = new MapView({
					map: map,
					container: "mapContainer",
					basemap: 'osm',
					center: [-113.4990, 53.5405],
					zoom: 15
				});
	
				this.setState({
					map,
					view
				})

				})

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