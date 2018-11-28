import React from "react";

import Actions from "./MapActions";
import MapFilterModal from "./MapFilterModal.jsx";

export default class SummaryMapView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

  	componentDidMount() {
		Actions.loadMapDetails();
	}
	
	render() {
		return (
			<div id="main">
				<div id="mapContainer" />
				<MapFilterModal />
				<div id="BasemapToggle" />
			</div>
		);
	}
}
