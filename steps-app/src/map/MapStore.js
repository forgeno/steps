import Reflux from "reflux";
import esriLoader from "esri-loader";
import Actions from "./MapActions";
import {esriURL, layerURL, downtownLongitude, downtownLatitude, sidewalkColorMapRenderer} from "../constants/ArcGISConstants";
import RestUtil from "../util/RestUtil";

export default class MapStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {
			sidewalks: [],
			sidewalkSelected: false,
			longitude: downtownLongitude,
			latitude: downtownLatitude,
			mapFilters: [],
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

			return esriLoader.loadModules(["esri/layers/FeatureLayer", "esri/geometry/Circle", "esri/widgets/Legend", "esri/widgets/Expand"], esriURL);
		}).then((data) => {
			
			const FeatureLayer = data[0],
				Circle = data[1],
				Legend = data[2],
				Expand = data[3],
				view = this.state.view;	
			
			const featureLayer = new FeatureLayer({
				url: layerURL,
				renderer: sidewalkColorMapRenderer,
				definitionExpression: ""
			});
			
			this.setState({
				sidewalkColorMapRenderer,
				featureLayer
			});
			
			// set the feature layer in window so we can access this when rating a sidewalk
			window.featureLayer = featureLayer;
	 
			view.when(() => {
				// get the first layer in the collection of operational layers in the WebMap
				// when the resources in the MapView have loaded.
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

				updateView(view.widthBreakpoint === "xsmall");
				
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
					const toAdd = isMobile ? expandLegend : legend;
					const toRemove = isMobile ? legend : expandLegend;
			
					view.ui.remove(toRemove);
					view.ui.add(toAdd, "bottom-left");
					view.ui.add("filterGUIMinimized", "bottom-left");
					view.ui.add("filterGUI", "bottom-left");
				  }
			});

			/*function queryAllSidewalks() {
				return featureLayer.queryFeatures(featureLayer.createQuery()).then(function(response) {
					return response.features
				});
			}
			
			// TODO: what does this do
			queryAllSidewalks();*/
			// radius to search in
			const pxRadius = 5;
			this.state.map.add(featureLayer);

			this.state.view.on("click", (event) => {
				let sidewalkGPSAdress = '';
				const pxToMeters = view.extent.width / view.width;

				featureLayer.popupEnabled = false;
				view.popup.dockEnabled = true;
				view.popup.visible = false;
				view.popup.dockOptions = {
					buttonEnabled: false
				}
				featureLayer.popupTemplate = {
					title: "Street ID: {osm_id}",
					content: "Average Rating: {AvgOverall}"
				}  
						
				const c = new Circle({
					center: event.mapPoint,
					radius: pxRadius * pxToMeters // meters by default
				});

				this.state.search.clear();
				if (this.state.search.activeSource) {
					this.state.search.activeSource.locator.locationToAddress(event.mapPoint).then((response) => {
						sidewalkGPSAdress = response.address.split(',')[0];
					  }, (err) => {
						console.error("Error reverse GPS to address")
					  });
					}

				const q = featureLayer.createQuery();
				q.geometry = c;
				
				featureLayer.queryFeatures(q).then((results) => {
					if (results.features.length !== 0){
						const sidewalkID = parseInt(results.features[0].attributes.osm_id)
						const sidewalk = this.state.sidewalks.find((s) => s.id === sidewalkID);
						sidewalk.address = sidewalkGPSAdress;
						
						if (!sidewalk) {
							console.error("No sidewalk with a matching ID was found");
							return;
						}
						this.viewSidewalkDetails(sidewalk, event.mapPoint.latitude, event.mapPoint.longitude);
					}
				});
			});
		});
	}

	onAddFilter(strTrait, strEquality, strNumberSelect, dbTrait) {
		const newMapFilters = this.state.mapFilters;
		newMapFilters.push({
			trait: strTrait,
			operator: strEquality,
			value: strNumberSelect,
			dbTrait: dbTrait
		});

		this.setState({
			mapFilters: newMapFilters
		});
	}

	onRemoveFilter(index) {
		const newMapFilters = this.state.mapFilters;
		newMapFilters.splice(index, 1);
		this.setState({
			mapFilters: newMapFilters
		});
		this.onFilterMap();
	}
	
	onClearFilters(){
		this.state.featureLayer.definitionExpression = "";
		this.setState({
			mapFilters: []
		});
	}

	onFilterMap() {
		this.state.featureLayer.definitionExpression = this.state.mapFilters.map((filter) => {
			return `${filter.dbTrait} ${filter.operator} ${filter.value}`;
		}).join(" and ");
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