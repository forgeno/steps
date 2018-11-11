import React from "react";
import Reflux from "reflux";

import Radio from '@material-ui/core/Radio';
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

import Store from "./SummaryStatisticsStore";
import Actions from "./SummaryStatisticsActions";
import LoaderComponent from "../misc-components/LoaderComponent";
import {getRatingDescription} from "../util/RatingUtil";

const round = (cell) => {
	return cell.toFixed(2);
};

/**
 * Renders summary statistics for sidewalk details
 */
export default class SummaryStatisticsSidewalksView extends Reflux.Component {

	constructor() {
		super();
		this.store = Store;
		this.state = {
			textDescription: true
		};
	}

	componentDidMount() {
		if (!this.state.sidewalks) {
			Actions.loadSidewalkContributionsSummary();
		}
	}
	
	_selectTextDescription = () => {
		this.setState({
			textDescription: true
		});
	};
	
	_selectNumericDescription = () => {
		this.setState({
			textDescription: false
		});
	};
	
	renderSidewalksTable() {
		const formatFunc = (cell) => {
			if (this.state.textDescription) {
				return getRatingDescription(cell);
			}
			return round(cell);
		};
		return (
			<BootstrapTable data={this.state.sidewalks} pagination options={{sizePerPage:50}} keyField="id">
				<TableHeaderColumn className="lightFontWeight" dataField='address' filter={{type: 'TextFilter'}} dataSort>Address</TableHeaderColumn>
				<TableHeaderColumn className="lightFontWeight" dataField='overallRating' dataSort dataFormat={formatFunc}>Overall Rating</TableHeaderColumn>
				<TableHeaderColumn className="lightFontWeight" dataField='accessibility' dataSort dataFormat={formatFunc}>Accessibility</TableHeaderColumn>
				<TableHeaderColumn className="lightFontWeight" dataField='comfort' dataSort dataFormat={formatFunc}>Comfort</TableHeaderColumn>
				<TableHeaderColumn className="lightFontWeight" dataField='connectivity' dataSort dataFormat={formatFunc}>Connectivity</TableHeaderColumn>
				<TableHeaderColumn className="lightFontWeight" dataField='physicalSafety' dataSort dataFormat={formatFunc}>Physical Safety</TableHeaderColumn>
				<TableHeaderColumn className="lightFontWeight" dataField='senseOfSecurity' dataSort dataFormat={formatFunc}>Sense of Security</TableHeaderColumn>
			</BootstrapTable>
		);
	}
	
	renderFormatSelection() {
		return (
			<div>
				 <Radio
				  checked={this.state.textDescription}
				  onChange={this._selectTextDescription}
				  value="Text"
				  name="text-description"
				  aria-label="text"
				  color="primary"
				/>
				<span className="formLabel" onClick={this._selectTextDescription}>Text</span>
				<Radio
				  checked={!this.state.textDescription}
				  onChange={this._selectNumericDescription}
				  value="Numeric"
				  name="numeric-description"
				  aria-label="numeric"
				  color="primary"
				/>
				<span className="formLabel" onClick={this._selectNumericDescription}>Numeric</span>
			</div>
		);
	}
	
	render() {
		if (!this.state.sidewalks) {
			return <LoaderComponent />;
		}
		
		return (
			<div data-summary-sidewalks className="statsPanel">
				{this.renderFormatSelection()}
				{this.renderSidewalksTable()}
			</div>
		)
	}
}