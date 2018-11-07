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

		if (process.env.NODE_ENV === "development"){
			window.DEV_MAP_STORE = this;
		}
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
	 */

    onDisplay(Map, MapView, FeatureLayer, Circle, Graphic, Legend) {
		
		const map = new Map({
			basemap: "dark-gray-vector"
		});

		var Rating = 4;

		// TODO: Confirm if it is impossible to pass a variable in the field parameter instead
		const sidewalkColorMapRenderer = {
			type: "unique-value",  // autocasts as new UniqueValueRenderer()
			field: "Rating",
			defaultSymbol: { type: "simple-fill" },  // autocasts as new SimpleFillSymbol()
			uniqueValueInfos: [{
				// All features with value of "North" will be blue
				value: 5,
				symbol: {
					type: "simple-line",  // autocasts as new SimpleLineSymbol()
					width: 3,
					color: "#00A300",
					style: "solid"
				}
			}, {
				// All features with value of "East" will be green
				value: 4,
				symbol: {
					type: "simple-line",  // autocasts as new SimpleLineSymbol()
					width: 3,
					color: "#00A392",
					style: "solid"
				}
			}, {
				// All features with value of "East" will be green
				value: 3,
				symbol: {
					type: "simple-line",  // autocasts as new SimpleLineSymbol()
					width: 3,
					color: "#FF7A00",
					style: "solid"
				}
			}, {
				// All features with value of "East" will be green
				value: 2,
				symbol: {
					type: "simple-line",  // autocasts as new SimpleLineSymbol()
					width: 3,
					color: "#FFDF00",
					style: "solid"
				}
			}, {
				// All features with value of "East" will be green
				value: 1,
				symbol: {
					type: "simple-line",  // autocasts as new SimpleLineSymbol()
					width: 3,
					color: "#FF0000",
					style: "solid"
				}
			}, {
				// All features with value of "East" will be green
				value: "",
				symbol: {
					type: "simple-line",  // autocasts as new SimpleLineSymbol()
					width: 3,
					color: "#D2D3D1",
					style: "solid"
				}
			  }],
		  };
 
		const view = new MapView({
			map: map,
			container: "mapContainer",
			basemap: 'osm',
			center: [this.state.longitude, this.state.latitude],
			zoom: 15
		});

		const featureLayer = new FeatureLayer({
			url: layerURL,
			renderer: sidewalkColorMapRenderer
		});
		
		const demoSym = {
          type: "simple-fill",
          color: [33, 188, 220, 0.9],
          style: "solid",
          outline: {
            color: "blue",
            width: 1
          }
        };
        
        // radius to search in
        const pxRadius = 5;
		map.add(featureLayer);

		view.on("click", (event) => {	
			//let pxToMeters = view.extent.width / view.width;
			let a = 5;
			let pxToMeters = view.extent.width / view.width;

			featureLayer.popupEnabled = false
			featureLayer.popupTemplate = {
				content: "Unique ID: {osm_id}"
			}  
					
			let c = new Circle({
				center: event.mapPoint,
				radius: pxRadius * pxToMeters // meters by default
			  });

			let g = new Graphic({
				geometry: c,
				symbol: demoSym
			  });

			let q = featureLayer.createQuery();
			q.geometry = c;
			featureLayer.queryFeatures(q).then((results) => {
				if(results.features.length !== 0){
					let sidewalkID = parseInt(results.features[0].attributes.osm_id)
					let ratingValue = parseInt(results.features[0].attributes.Rating)
					console.log(results);
					console.log(results.features);
					view.center = [event.mapPoint.longitude, event.mapPoint.latitude];
					this.setState({
						longitude: event.mapPoint.longitude,
						latitude: event.mapPoint.latitude,
						sidewalkSelected: true,
						selectedSidewalkDetails: {
							id: sidewalkID,
							overallRating: ratingValue,
							connectivity: 3
						}
					});
				}
          	});
		  }); 
		  

		this.setState({
			map,
			view
         });
	}
}
