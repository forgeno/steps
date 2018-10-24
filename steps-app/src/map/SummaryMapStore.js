import Reflux from "reflux";
import Actions from "./LoadMapActions";
import {layerURL} from "../constants/ArcGISConstants";

export default class SummaryMapStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {};
		this.listenables = Actions;
	}

	/**
	 * calls esriLoader which helps the react-app to communicate with the ArcGIS API for javascript
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
			center: [-113.4990, 53.5405],
			zoom: 15
		});
		
		const featureLayer = new FeatureLayer({
			url: layerURL
		});

		map.add(featureLayer);

		/**
		 * TODO: find a way to get the unique osm basemap id for sidewalks
		 */
		view.on("click",(data) => {
			// featureLayer.popupTemplate = {
			// 	content: "Unique ID: {osm_id}"
			// }
			this.setState({
				longitude: data.mapPoint.longitude,
				latitude: data.mapPoint.latitude,
				mapClicked: true
			});
		});

		this.setState({
			map,
			view
         });
	}
}
