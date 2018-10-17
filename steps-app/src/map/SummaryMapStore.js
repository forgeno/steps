import Reflux from "reflux";
import Actions from "./LoadMapActions";

export default class SummaryMapStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {};
		this.listenables = Actions;
	}

    onDisplayOSMBaseMap([Map, MapView]) {
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
        
        this.setState({
			map,
			view });
	}
}
