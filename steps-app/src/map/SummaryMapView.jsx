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
	
	/*Applies filter to map based on what is currently in the filter table.*/
	handleApplyFilterEvent = () => {
		Actions.filterMap()
	}
	/*Pulls strings from each filter selector element and places it into an array for future filter application.*/
	handleAddFilterEvent = () => {
		let filterTable = document.getElementById("filterTable");
		let rateTraitObj = document.getElementById("rateTrait")
		let equalitySelectorObj = document.getElementById("equalitySelector");
		let numberSelectorObj = document.getElementById("numberSelector");
		let strTrait = rateTraitObj.options[rateTraitObj.selectedIndex].text;
		let strEquality = equalitySelectorObj.options[equalitySelectorObj.selectedIndex].text;
		let strNumberSelect = numberSelectorObj.options[numberSelectorObj.selectedIndex].text;
		Actions.pushArray(strTrait,strEquality,strNumberSelect);

		let rowCount = filterTable.rows.length;
		let row = filterTable.insertRow(rowCount);
		let colCount = filterTable.rows[0].cells.length;

		let cell1 = row.insertCell(0);
		let cell2 = row.insertCell(0);
		let cell3 = row.insertCell(0)
		
		cell1.innerHTML = strNumberSelect;
		cell2.innerHTML = strEquality;
		cell3.innerHTML = strTrait;
	}
	/*Clears all filters currrently implimented onto the map. This includes the array of filter
	sand resets map view to have no filters*/
	handleClearFilterEvent = () => {
		let filterTable = document.getElementById("filterTable");
		for(let i = (filterTable.rows.length-1); i > 0; i--){
			filterTable.deleteRow(i);
		}
		Actions.clearFilters();
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
