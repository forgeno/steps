import React from "react";
import { Component } from 'reflux';

import Actions from "./MapActions";
import Store from "./MapStore";
import {Button} from "react-bootstrap";

export default class SummaryMapView extends Component {

	constructor() {
		super();
		this.store = Store;
	}

  	componentDidMount() {
		Actions.loadMapDetails();
	}
	
	handleApplyFilterEvent = () => {
		Actions.filterMap()
	}

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

	handleClearFilterEvent = () => {
		let filterTable = document.getElementById("filterTable");
		for(let i = (filterTable.rows.length-1); i > 0; i--){
			filterTable.deleteRow(i);
		}
		Actions.clearFilters();
	}

	

	render() {
		return (
			<div id = "main">
				<div id="mapContainer"/>
				<div id = "FilterGUIWrapper">
				<div id = "filterGUI">
					Filters:
					<br></br>
					<select id = "rateTrait"></select>
					<select id = "equalitySelector"></select>
					<select id = "numberSelector"></select>
					<Button className="AddFilter" bsStyle="success" bsSize="xs" onClick={this.handleAddFilterEvent}>+</Button>
					<br></br>	
					<table class="table table-bordered table-responsive-md table-striped text-center" id="filterTable">
							<thead>
								<tr>
									<th>Trait</th>
									<th>Equality</th>
									<th>Rate</th>
								</tr>
							</thead>
						<tbody class="filterTbody">
							<tr>
							</tr>
						</tbody>
					</table>
					<Button bsStyle="danger" bsSize="sm" onClick={this.handleClearFilterEvent}>Clear</Button>
					<Button className="applyButton" bsStyle="primary" bsSize="sm" onClick={this.handleApplyFilterEvent}> Apply Filter </Button>
					<div id = "filterList"/>
				</div>
				</div>
				
			
			<div id="BasemapToggle"/>
			</div>
			
		);
	}
}
