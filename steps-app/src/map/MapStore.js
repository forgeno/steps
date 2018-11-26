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
			listFilter: [],
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
		esriLoader.loadModules(['esri/Map', 'esri/views/MapView','esri/widgets/Search', "esri/widgets/BasemapToggle"], esriURL).then((data) => {
			const Map = data[0],
				MapView = data[1];
			
			const Search = data[2];
			const BasemapToggle = data[3];

			const map = new Map({
				basemap: "dark-gray-vector"
			});

			const view = new MapView({
				map: map,
				container: "mapContainer",
				center: [this.state.longitude, this.state.latitude],
				zoom: 15
			});

			const toggle = new BasemapToggle({
				view: view, // view that provides access to the map's 'topo' basemap
				nextBasemap: "osm" // allows for toggling to the 'hybrid' basemap
			  });
	  
			view.ui.add(toggle, "");

			const search = new Search({
				view: view
			});

			view.ui.add(search, "top-right");
			
			this.setState({
				map,
				view,
				search
			 });

			 

			return esriLoader.loadModules(["esri/layers/FeatureLayer", "esri/PopupTemplate", "esri/geometry/Circle", "esri/Graphic","esri/core/watchUtils","esri/renderers/UniqueValueRenderer","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol","esri/layers/support/MapImage", "esri/widgets/Legend", "esri/widgets/Expand"], esriURL);
		}).then((data) => {
			
			const FeatureLayer = data[0],
				PopupTemplate = data[1],
				Circle = data[2],
				Legend = data[9],
				Expand = data[10],
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
						width: 5,
						color: "#00A300",
						style: "solid"
					}
				}, {
					// All features with value of "East" will be green
					value: 4,
					symbol: {
						type: "simple-line",  // autocasts as new SimpleLineSymbol()
						width: 5,
						color: "#00A392",
						style: "solid"
					}
				}, {
					// All features with value of "East" will be green
					value: 3,
					symbol: {
						type: "simple-line",  // autocasts as new SimpleLineSymbol()
						width: 5,
						color: "#FF7A00",
						style: "solid"
					}
				}, {
					// All features with value of "East" will be green
					value: 2,
					symbol: {
						type: "simple-line",  // autocasts as new SimpleLineSymbol()
						width: 5,
						color: '#f9a602',
						style: "solid"
					}
				}, {
					// All features with value of "East" will be green
					value: 1,
					symbol: {
						type: "simple-line",  // autocasts as new SimpleLineSymbol()
						width: 5,
						color: "#FF0000",
						style: "solid"
					}
				}, {
					// All features with value of "East" will be green
					value: "",
					symbol: {
						type: "simple-line",  // autocasts as new SimpleLineSymbol()
						color: "#D2D3D1",
						width: 5,
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
	 
			view.when(() => {
				// get the first layer in the collection of operational layers in the WebMap
				// when the resources in the MapView have loaded.
				
				// Desktop
				const legend = new Legend({
				  view: view,
				  layerInfos: [{
					layer: featureLayer,
					title: "Sidewalk Ratings"
				  }]
				});
				
				//mobile
				const expandLegend = new Expand({
					view: view,
					content: new Legend({
					  view: view,
					  layerInfos: [{
						layer: featureLayer,
						title: "Sidewalk Ratings"
					  }]
					})
				});

				// Load
				const isResponsiveSize = view.widthBreakpoint === "xsmall";
				updateView(isResponsiveSize);

				// Breakpoints

				view.watch("widthBreakpoint", function(breakpoint) {
					switch (breakpoint) {
					  case "xsmall":
						updateView(true);
						break;
					  case "small":
					  	updateView(true);
					  	break;
					  case "medium":
					  case "large":
					  case "xlarge":
						updateView(false);
						break;
					  default:
					}
				  });

				  function updateView(isMobile) {
					setLegendMobile(isMobile);
				  }

				  function setLegendMobile(isMobile) {
					let toAdd = isMobile ? expandLegend : legend;
					let toRemove = isMobile ? legend : expandLegend;
			
					view.ui.remove(toRemove);
					view.ui.add(toAdd, "bottom-left");
					view.ui.add("filterGUI", "bottom-left")
				  }
			});

			function queryAllSidewalks() {
				let sidewalkQuery = featureLayer.createQuery();
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
					let option = document.createElement("option");
					option.text = element
					selectObj.add(option);
				});
			}
			
			let rateTraitObj = document.getElementById("rateTrait")
			let equalitySelectorObj = document.getElementById("equalitySelector");
			let numberSelectorObj = document.getElementById("numberSelector");
			let rateTraitString = ["Rating", "AvgSecurity","AvgAccessibility","AvgConnectivity","AvgComfort","AvgSafety"]
			let equalityString = ["<",">","=","<=",">="]
			let ratingString = ["5","4","3","2","1"]

			addSelectText(rateTraitString, rateTraitObj)
			addSelectText(equalityString, equalitySelectorObj)
			addSelectText(ratingString, numberSelectorObj)
			this.state.view.on("click", (event) => {
				let sidewalkGPSAdress = '';
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

				this.state.search.clear();
				if (this.state.search.activeSource) {
					var geocoder = this.state.search.activeSource.locator; // World geocode service
					geocoder.locationToAddress(event.mapPoint)
					  .then(function(response) { // Show the address found

						sidewalkGPSAdress = response.address.split(',')[0];
					  }, function(err) { // Show no address found
						console.error("Error reverse GPS to address")
					  });
					}

				let q = featureLayer.createQuery();
				q.geometry = c;
				featureLayer.queryFeatures(q).then((results) => {
					if(results.features.length !== 0){

						let resultingFeatures = results.features;
						let sidewalkID = parseInt(resultingFeatures[0].attributes.osm_id)
						const sidewalk = this.state.sidewalks.find((s) => s.id === sidewalkID);
						sidewalk.address = sidewalkGPSAdress;
						if (!sidewalk) {
							console.error("No sidewalk with a matching ID was found");
							return;
						}
						
						//Add graphic to the map graphics layer.

						this.viewSidewalkDetails(sidewalk, event.mapPoint.latitude, event.mapPoint.longitude);
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
	}

	onClearFilters(){
		this.state.featureLayer.definitionExpression = ''
		this.setState({
			listFilter: []
		})
	}

	onFilterMap(){
		esriLoader.loadModules(["esri/tasks/support/Query"], esriURL).then((data) => {
			let returnSidewalks = null
			let sidewalkSQLString = ''
			
			for(let i=0; i < this.state.listFilter.length; i++){
				if(sidewalkSQLString == ''){
					sidewalkSQLString = this.state.listFilter[i];
				}else{
					sidewalkSQLString = sidewalkSQLString+" and "+this.state.listFilter[i];
				}
				
			}
			this.state.featureLayer.definitionExpression = sidewalkSQLString
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



