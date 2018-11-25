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
		var table = document.getElementById("filterTable");
		var rateTraitObj = document.getElementById("rateTrait")
		var equalitySelectorObj = document.getElementById("equalitySelector");
		var numberSelectorObj = document.getElementById("numberSelector");
		var strTrait = rateTraitObj.options[rateTraitObj.selectedIndex].text;
		var strEquality = equalitySelectorObj.options[equalitySelectorObj.selectedIndex].text;
		var strNumberSelect = numberSelectorObj.options[numberSelectorObj.selectedIndex].text;
		Actions.pushArray(strTrait,strEquality,strNumberSelect);

		var rowCount = table.rows.length;
		var row = table.insertRow(rowCount);
		var colCount = table.rows[0].cells.length;
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(0);
		var cell3 = row.insertCell(0)
		cell1.innerHTML = strNumberSelect;
		cell2.innerHTML = strEquality;
		cell3.innerHTML = strTrait;
	}

	handleClearFilterEvent = () => {
		var table = document.getElementById("filterTable");
		for(let i = (table.rows.length-1); i > 0; i--){
			table.deleteRow(i);
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
					{/* <button id = "addFilter">+</button> */}
					{/* <button onClick="handleApplyfilterEvent()">Apply Filter</button> */}
					<Button className="AddFilter" bsStyle="success" bsSize="xs" onClick={this.handleAddFilterEvent}>+</Button>
					<br></br>	
					<table class="table table-bordered table-responsive-md table-striped text-center" id="filterTable">
							<thead>
								<tr>
									<th class="text-center">Trait</th>
									<th class="text-center">Equality</th>
									<th class="text-center">Rate</th>
								</tr>
							</thead>
						<tbody id="filterTbody">
							<tr className="cellBox">
							</tr>
						</tbody>
					</table>
					<Button bsStyle="danger" bsSize="sm" onClick={this.handleClearFilterEvent}>Clear</Button>
					<Button className="applyButton" bsStyle="primary" bsSize="sm" onClick={this.handleApplyFilterEvent}> Apply Filter </Button>
					<div id = "filterList"/>
				</div>
				</div>
			</div>
		);
	}
}
