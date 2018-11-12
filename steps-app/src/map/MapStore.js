import Reflux from "reflux";
import esriLoader from "esri-loader";

import Actions from "./MapActions";
import {esriURL, layerURL, downtownLongitude, downtownLatitude} from "../constants/ArcGISConstants";
import RestUtil from "../util/RestUtil";

export default class MapStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {
			sidewalks: [],
			sidewalkSelected: false,
			longitude: downtownLongitude,
			latitude: downtownLatitude,
			searchVisible: false
		};
		this.listenables = Actions;

		if (process.env.NODE_ENV === "development"){
			window.DEV_MAP_STORE = this;
		}
	}

	/**
	 * Displays the selected sidewalk
	 * @param {Object} sidewalk - details about the sidewalk
	 * @param {number} latitude - the latitude of the sidewalk's center position
	 * @param {number} longitude - the longitude of the sidewalk's center position
	 */
	viewSidewalkDetails(sidewalk, latitude, longitude) {
		if (!this.state.view) {
			console.error("The view was not loaded");
			return;
		}

		this.state.view.goTo({
			center: [longitude, latitude],
			animate: true,
			duration: 200,
			easing: "easy-in"
		});
		this.setState({
			longitude: longitude,
			latitude: latitude,
			sidewalkSelected: true,
			selectedSidewalkDetails: sidewalk
		});
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
	 */

    onLoadMapDetails() {
		esriLoader.loadModules(['esri/Map', 'esri/views/MapView'], esriURL).then((data) => {
			const Map = data[0],
				MapView = data[1];
			
			const map = new Map({
				basemap: "dark-gray-vector"
				//layers: [featureLayer],
			});

			const view = new MapView({
				map: map,
				container: "mapContainer",
				center: [this.state.longitude, this.state.latitude],
				zoom: 15
			});

			this.setState({
				map,
				view
			 });
			return esriLoader.loadModules(["esri/layers/FeatureLayer", "esri/PopupTemplate", "esri/geometry/Circle", "esri/Graphic","esri/core/watchUtils","esri/renderers/UniqueValueRenderer","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol","esri/layers/support/MapImage", "esri/widgets/Legend", "esri/widgets/Search"], esriURL);
		}).then((data) => {
			
			const FeatureLayer = data[0],
				PopupTemplate = data[1],
				Circle = data[2],
				Graphic = data[3],
				watchUtils = data[4],
				UniqueValueRenderer = data[5],
				SimpleFillSymbol = data[6],
				SimpleLineSymbol = data[7],
				MapImage = data[8],
				Legend = data[9],
				view = this.state.view;
			
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
				  highlightOptions: {
					color: [255, 241, 58],
					fillOpacity: 0.4
				  }
			  };

			const featureLayer = new FeatureLayer({
				url: layerURL,
				renderer: sidewalkColorMapRenderer
			});
			
			this.setState({
				featureLayer: featureLayer
			});
	 
			view.when(() => {
				// get the first layer in the collection of operational layers in the WebMap
				// when the resources in the MapView have loaded.
				//var featureLayer = map.layers.getItemAt(0);
				var legend = new Legend({
				  view: view,
				  layerInfos: [{
					layer: featureLayer,
					title: "Sidewalk Ratings"
				  }]
				});
	  
				// Add widget to the bottom right corner of the view
				view.ui.add(legend, "bottom-left");
			  });

			// radius to search in
			const pxRadius = 5;
			this.state.map.add(featureLayer);

			this.state.view.on("click", (event) => {
				//let pxToMeters = view.extent.width / view.width;

				var highlightSelect, highlightHover;
				let pxToMeters = view.extent.width / view.width;

				// this may be removed later 
				featureLayer.popupEnabled = false;
				view.popup.dockEnabled = true;
				view.popup.visible = false;
				view.popup.dockOptions = {
					buttonEnabled: false
				}
				featureLayer.popupTemplate = {
					title: "Street ID: {osm_id}",
					content: "Average Rating: {Rating}"
				}  
						
				let c = new Circle({
					center: event.mapPoint,
					radius: pxRadius * pxToMeters // meters by default
				});

				let q = featureLayer.createQuery();
				q.geometry = c;
				featureLayer.queryFeatures(q).then((results) => {
					if(results.features.length !== 0){

						let resultingFeatures = results.features;
						
						// TODO: fix some sidewalks osm_id being " " (NaN)
						let sidewalkID = parseInt(resultingFeatures[0].attributes.osm_id)
						let ratingValue = parseInt(resultingFeatures[0].attributes.Rating)
						const sidewalk = this.state.sidewalks.find((s) => s.id === sidewalkID);
						if (!sidewalk) {
							console.error("No sidewalk with a matching ID was found");
							return;
						}
						//console.log(resultingFeatures)
						//Add graphic to the map graphics layer.

						this.viewSidewalkDetails(sidewalk, event.mapPoint.latitude, event.mapPoint.longitude);
					}
				});
			});
		});
		
	}
	
	/**
	 * Updates the ratings for the currently selected sidewalk
	 * @param {Object} sidewalk - the current sidewalk
	 */
	onUpdateSidewalkRatings(sidewalk) {
		const updatedSidewalks = this.state.sidewalks.slice();
		const selectedSidewalk = updatedSidewalks.find((sidewalk) => {
			return sidewalk.id === this.state.selectedSidewalkDetails.id;
		});
		if (!selectedSidewalk) {
			return;
		}
		
		selectedSidewalk.accessibility = sidewalk.accessibility;
		selectedSidewalk.overallRating = sidewalk.overallRating;
		selectedSidewalk.comfort = sidewalk.comfort;
		selectedSidewalk.connectivity = sidewalk.connectivity;
		selectedSidewalk.physicalSafety = sidewalk.physicalSafety;
		selectedSidewalk.senseOfSecurity = sidewalk.senseOfSecurity;
		this.setState({
			sidewalks: updatedSidewalks
		});
	}
	
	/**
	 * Displays the search bar
	 */
	onDisplaySearch() {
		this.setState({
			searchVisible: true
		});
	}
	
	/**
	 * Hides the search bar
	 */
	onDismissSearch() {
		this.setState({
			searchVisible: false
		});
	}
	
	/**
	 * Selects the specified sidewalk and displays details about it, when the user searches for the sidewalk
	 */
	onSelectSidewalk(sidewalk) {
		if (!this.state.featureLayer) {
			this.viewSidewalkDetails(sidewalk, this.state.latitude, this.state.longitude);
			return;
		}

		const q = this.state.featureLayer.createQuery();
		this.state.featureLayer.queryFeatures(q).then((results) => {
			const result = results.features.find((feature) => parseInt(feature.attributes.osm_id) === sidewalk.id);
			if (result) {
				this.viewSidewalkDetails(sidewalk, result.geometry.extent.center.latitude, result.geometry.extent.center.longitude);
			} else {
				this.viewSidewalkDetails(sidewalk, this.state.latitude, this.state.longitude);
			}
		});
	}
}
