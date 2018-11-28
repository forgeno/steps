import React from "react";
import { Component } from 'reflux';

import CloseIcon from '@material-ui/icons/Close';

import Actions from "./MapActions";
import Store from "./MapStore";
import {Button, FormGroup, ControlLabel, FormControl} from "react-bootstrap";

const TRAITS = ["Overall", "Accessibility", "Comfort", "Connectivity", "Physical Safety", "Sense of Security"];
const OPERATORS = [">", "<", ">=", "<=", "="];
const VALUES = [1, 2, 3, 4, 5];
const TRAIT_MAP = {
	"Overall": "AvgOverall",
	"Sense of Security": "AvgSecurity",
	"Accessibility": "AvgAccessibility",
	"Connectivity": "AvgConnectivity",
	"Comfort": "AvgComfort",
	"Physical Safety": "AvgSafety"
};

/**
 * Renders the modal allowing users to filter which sidewalks they want to see
 */
export default class MapFilterModal extends Component {

	constructor() {
		super();
		this.store = Store;
		this.state = {
			selectedTrait: TRAITS[0],
			selectedOperator: OPERATORS[0],
			selectedValue: VALUES[0],
			isExpanded: false
		};
	}

	handleAddFilterEvent = () => {
		Actions.addFilter(this.state.selectedTrait, this.state.selectedOperator, this.state.selectedValue, TRAIT_MAP[this.state.selectedTrait]);
	}

	handleClearFilterEvent = () => {
		Actions.clearFilters();
	}

	_handleTraitChange = (e) => {
		this.setState({
			selectedTrait: e.target.value
		});
	};
	
	_handleOperatorChange = (e) => {
		this.setState({
			selectedOperator: e.target.value
		});
	};
	
	_handleValueChange = (e) => {
		this.setState({
			selectedValue: e.target.value
		});
	};
	
	_expand = () => {
		this.setState({
			isExpanded: true
		});
	};
	
	_minimize = () => {
		this.setState({
			isExpanded: false
		});
	};
	
	renderTable() {
		return (
			<table className="table table-bordered table-responsive-md table-striped text-center filterTable">
				<thead>
					<tr>
						<th>Trait</th>
						<th>Operator</th>
						<th>Value</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{
						this.state.mapFilters.map((filter, i) => {
							return (
								<tr key={i}>
									<th>
										{filter.trait}
									</th>
									<th>
										{filter.operator}
									</th>
									<th>
										{filter.value}
									</th>
									<th>
										<CloseIcon className="closeButton" onClick={() => Actions.removeFilter(i)} />
									</th>
								</tr>
							);
						})
					}
				</tbody>
			</table>
		);
	}
	
	_getModalStyle = () => {
		return this.state.isExpanded ? undefined : {opacity: 0};
	};
	
	_getMinimizedModalStyle = () => {
		return !this.state.isExpanded ? undefined : {opacity: 0};
	};
	
	renderSelect(name, values, selected, onChange) {
		return (
			<div className="filterSelectGroup">
				<FormGroup controlId="formControlsSelect">
				  <ControlLabel>{name}</ControlLabel>
				  <FormControl componentClass="select" placeholder="select" onChange={onChange}>
					{
						values.map((trait) => <option value={trait}>{trait}</option>)
					}
				  </FormControl>
				</FormGroup>
			</div>
		);
	}
	
	renderModalContent() {
		if (this.state.isExpanded) {
			return (
				<div>
					<div className="filtersHeader">
						<h4 className="filterTitle">Filters</h4>
						<CloseIcon className="closeFilters floatRight" onClick={this._minimize} />
					</div>
					<div className="filterWrapper">
						{this.renderSelect("Trait", TRAITS, this.state.selectedTrait, this._handleTraitChange)}
						{this.renderSelect("Operator", OPERATORS, this.state.selectedOperator, this._handleOperatorChange)}
						{this.renderSelect("Value", VALUES, this.state.selectedValue, this._handleValueChange)}
						<Button className="addFilter" bsStyle="primary" bsSize="sm" onClick={this.handleAddFilterEvent}>Add</Button>
					</div>
					{this.renderTable()}
					<div className="btn-group floatRight">
						<Button bsStyle="danger" bsSize="sm" onClick={this.handleClearFilterEvent} disabled={this.state.mapFilters.length === 0}>Clear</Button>
						<Button className="applyButton" bsStyle="primary" bsSize="sm" onClick={Actions.filterMap} disabled={this.state.mapFilters.length === 0}>Apply Filter</Button>
					</div>
				</div>
			);
		}
		return null;
	}
	
	render() {
		return (
			<div className="FilterGUIWrapper">
				<div id="filterGUI" style={this._getModalStyle()}>
					{this.renderModalContent()}
				</div>
				<div id="filterGUIMinimized" style={this._getMinimizedModalStyle()}>
					<Button bsStyle="primary" onClick={this._expand}>Filters</Button>
				</div>
			</div>
		);
	}
}
