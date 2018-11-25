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
			listFilter: []
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

			
			view.ui.add("filterGUI", "top-left")
			return esriLoader.loadModules(["esri/layers/FeatureLayer", "esri/PopupTemplate", "esri/geometry/Circle", "esri/Graphic","esri/core/watchUtils","esri/renderers/UniqueValueRenderer","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol","esri/layers/support/MapImage", "esri/widgets/Legend", "esri/widgets/Search"], esriURL);
		}).then((data) => {
			
			const FeatureLayer = data[0],
				PopupTemplate = data[1],
				Circle = data[2],
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
				sidewalkColorMapRenderer,
				featureLayer
			});
			view.when(function() {
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

			function queryAllSidewalks() {
				var sidewalkQuery = featureLayer.createQuery();
				return featureLayer.queryFeatures(sidewalkQuery).then(function(response) {
					let returnSidewalks = response.features;
					return returnSidewalks
				});
				
			}
			queryAllSidewalks();
			// radius to search in
			const pxRadius = 5;
			console.log(featureLayer)
			this.state.map.add(featureLayer);

			//Start of FilterMap code
			
			function addSelectText (stringList, selectObj){
				stringList.forEach(function(element) {
					var option = document.createElement("option");
					option.text = element
					selectObj.add(option);
				});
			}

			

			var rateTraitObj = document.getElementById("rateTrait")
			var equalitySelectorObj = document.getElementById("equalitySelector");
			var numberSelectorObj = document.getElementById("numberSelector");
			var addFilterObj = document.getElementById("addFilter");
			var applyFilterObj = document.getElementById("applyFilter");
			var filterListObj = document.getElementById("filterList");

			let rateTraitString = ["Rating", "AvgSecurity","AvgAccessibility","AvgConnectivity","AvgComfort","AvgSafety"]
			let equalityString = ["<",">","=","<=",">="]
			let ratingString = ["5","4","3","2","1"]

			addSelectText(rateTraitString, rateTraitObj)
			addSelectText(equalityString, equalitySelectorObj)
			addSelectText(ratingString, numberSelectorObj)
			
			// applyFilterObj.addEventListener("click", function () {
			// 	const sidewalkArr = this.state.sidewalks
			// 	console.log(sidewalkArr)
			// 	//console.log(sidewalks)
			// 	.then()
			//   });

			//End of filter map code
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

						view.goTo({
							center: [event.mapPoint.longitude, event.mapPoint.latitude],
							animate: true,
							duration: 200,
							easing: "easy-in"
						})
						this.setState({
							longitude: event.mapPoint.longitude,
							latitude: event.mapPoint.latitude,
							sidewalkSelected: true,
							selectedSidewalkDetails: sidewalk
						});
					}
				});
			});
		});
	}

	onPushArray(strTrait, strEquality, strNumberSelect) {
		const tempListFilter = this.state.listFilter;
		tempListFilter.push(String(strTrait)+" "+String(strEquality)+" "+String(strNumberSelect));

		this.setState({
			listFilter: tempListFilter
		})

		//console.log(this.state.listFilter)
		
	}

	onClearFilters(){
		this.setState({
			listFilter: []
		})
	}

	onFilterMap(){
		esriLoader.loadModules(["esri/tasks/support/Query"], esriURL).then((data) => {
			let returnSidewalks = null
			var query = this.state.featureLayer.createQuery();
			for(let i=0; i < this.state.listFilter.length; i++){
				query.where = this.state.listFilter[i];
			}
			query.outFields = ["*"];
			let sidewalkQuery = this.state.featureLayer.createQuery();
			this.state.featureLayer.queryFeatures(sidewalkQuery).then(function(response) {
				returnSidewalks = response.features;
				console.log(returnSidewalks)
			});
			this.state.featureLayer.queryFeatures(query).then(function(response){
				//console.log(response.features)
				const editMap = {
					deleteFeatures: [response.features[0]]
				}
				this.state.featureLayer.applyEdits(editMap).then(function(editsResult) {
					//console.log(editsResult.deleteFeatureResults)
					//console.log(editsResult)
					// Get the objectId of the newly added feature.
					// Call selectFeature function to highlight the new feature.
					//this.state.featureLayer.deleteFeatures()
				//   }).catch(function(error) {
				// 	console.log("===============================================");
				// 	console.error("[ applyEdits ] FAILURE: ", error.code, error.name,
				// 	  error.message);
				// 	console.log("error = ", error);
				  });
			});
		});
	}
	
}



