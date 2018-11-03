import Reflux from "reflux";

import Actions from "./MapActions";
import {layerURL, downtownLongitude, downtownLatitude} from "../constants/ArcGISConstants";
import RestUtil from "../util/RestUtil";

export default class MapStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {
			sidewalks: [],
			sidewalkSelected: false,
			longitude: downtownLongitude,
			latitude: downtownLatitude
		};
		this.listenables = Actions;
	}

	onLoadAllSidewalks() {
		RestUtil.sendGetRequest("sidewalk").then((res) => {
			this.setState({
				sidewalks: res
			});
		}).catch((err) => {
			console.error(err);
		});
	}
	
	onSetDrawerOpened(open) {
		this.setState({
			sidewalkSelected: open
		});
	}
	
	/**
	 * Calls esriLoader which helps the react-app to communicate with the ArcGIS API for javascript
	 * @param {class} Map class that specifies the type of basemap for the map to laod as
	 * @param {class} MapView specifies which div element to bind to, the initial map location and functions to pass in
	 * @param {class} FeatureLayer allows the layering of the maps on the basemap
	 * @param {class} PopupTemplate displays a popup on the map when clicked
	 */
    onDisplay(Map, MapView, FeatureLayer, PopupTemplate) {
		const map = new Map({
			basemap: "osm"
		});
	
		const view = new MapView({
			map: map,
			container: "mapContainer",
			basemap: 'osm',
			center: [this.state.longitude, this.state.latitude],
			zoom: 15
		});
		
		const featureLayer = new FeatureLayer({
			url: layerURL
		});

		map.add(featureLayer);
		view.on("click",(data) => {
			// featureLayer.popupTemplate = {
			// 	content: "Unique ID: {osm_id}"
			// }
			// TODO: set sidewalk ID from data instead of using mock
			view.center = [data.mapPoint.longitude, data.mapPoint.latitude];
			this.setState({
				longitude: data.mapPoint.longitude,
				latitude: data.mapPoint.latitude,
				sidewalkSelected: true,
				selectedSidewalkDetails: this.state.sidewalks.find((sidewalk) => sidewalk.id === 2)

			});
		});

		this.setState({
			map,
			view
         });
	}
}
