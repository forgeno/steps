import React from "react";
import Reflux from "reflux";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Radio from '@material-ui/core/Radio';
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import {Line} from "react-chartjs-2";

import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

import Store from "./SummaryStatisticsStore";
import Actions from "./SummaryStatisticsActions";
import DateUtilities from "../util/DateUtilities";
import LoaderComponent from "../misc-components/LoaderComponent";
import AdminStore from "../admin/AdminStore";

import {CSVLink} from 'react-csv';
import { Button } from "react-bootstrap"

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import {getRatingDescription} from "../util/RatingUtil";

const round = (cell) => {
	return cell.toFixed(2);
};

/**
 * Renders summary statistics across all sidewalks
 */
export default class SummaryStatisticsView extends Reflux.Component {

	constructor() {
		super();
		this.stores = [Store, AdminStore];
		this.state = {
			selectedTab: 0,
			textDescription: true
		};
	}

	componentDidMount() {
		Actions.loadSummaryStatistics();
	}
	
	/** 
	 * Handles the user changing the currently selected tab
	 * @param {Object} event - the HTML event representing the selection
	 * @param {Number} value - the index of the new selected tab
	 */
	_onChangeTab = (event, value) => {
		this.setState({
			selectedTab: value
		});
	};
	
	/**
	 * Handles the user selecting the option to view ratings in textual format
	 */
	_selectTextDescription = () => {
		this.setState({
			textDescription: true
		});
	};
	
	/**
	 * Handles the user selecting the option to view ratings in numeric format
	 */
	_selectNumericDescription = () => {
		this.setState({
			textDescription: false
		});
	};
	
	/**
	 * Renders a summary card
	 * @param {String} title - the card header
	 * @param {Number} value - the value of the card statistic
	 * @return {JSX} - the rendered summary card
	 */
	renderCard(title, value) {
		return (
			<Grid item xs>
				<Card className="card">
					<CardContent>
						<h3 data-contributions-value={value}>
							{value}
						</h3>
						{title}
					</CardContent>
				</Card>
			</Grid>
		);
	}
	
	/**
	 * Renders the contributions by date table
	 */
	renderContributionsByDate() {
		const data = this.state.contributionsByMonth.map((contribution) => {
			return {
				month: parseInt(contribution.monthYear.split("/")[0]),
				year: parseInt(contribution.monthYear.split("/")[1]),
				amount: contribution.contributions
			};
		});
		return (
			<BootstrapTable data={data} pagination={data.length > 30} keyField="a">
				<TableHeaderColumn className="lightFontWeight" dataField='month' dataSort dataFormat={DateUtilities.getMonthName}>Month</TableHeaderColumn>
				<TableHeaderColumn className="lightFontWeight" dataField='year' dataSort>Year</TableHeaderColumn>
				<TableHeaderColumn className="lightFontWeight" dataField='amount' dataSort>Contributions</TableHeaderColumn>
			</BootstrapTable>
		);
	}
	
	/**
	 * Renders the contributions by month chart
	 */
	renderContributionsChart() {
		const data = {
			labels: this.state.contributionsByMonth.map((contribution) => {
				const split = contribution.monthYear.split("/");
				return `${DateUtilities.getMonthName(parseInt(split[0]))} ${split[1]}`;
			}),
			datasets: [{
				label: "Contributions By Month",
				data: this.state.contributionsByMonth.map((contribution) => {
					return contribution.contributions;
				}),
				backgroundColor: "purple"
			}]
		}
		return (
			<Line data={data} options={{
				legend: {
					display: false
				},
				scales: {
				 yAxes: [{
					gridLines: {
						display: false
					}  
				  }]
				 },
			}} />
		);
	}
	
	/**
	 * Renders everything on the contributions tab
	 */
	renderContributions() {
		if (!this.state.contributionsByMonth) {
			return <LoaderComponent />;
		}
		return (
			<div data-summary-contributions className="contributions">
				<Grid container spacing={16}>
					{this.renderCard("Total Ratings", this.state.totalRatings)}
					{this.renderCard("Total Comments", this.state.totalComments)}
					{this.renderCard("Total Images", this.state.totalImagesUploaded)}
					{this.renderCard("Contributions", this.state.totalImagesUploaded + this.state.totalRatings + this.state.totalComments)}
				</Grid>
				<div className="table">
					{this.renderContributionsByDate()}
				</div>
				{this.renderContributionsChart()}
			</div>
		);
	}
	
	/**
	 * Renders the format selection row in the sidewalk details tab
	 */
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
				
				{this.state.csvFormatted && this.state.isLoggedIn && <CSVLink data={this.state.csvFormatted}>
					<Button bsStyle="primary" className="csvButton">
						Export CSV
					</Button>
				</CSVLink>}
			</div>
		);
	}
	
	/**
	 * Renders everything on the sidewalk details tab
	 */
	renderSidewalkDetails() {
		if (!this.state.sidewalkSummary) {
			return <LoaderComponent />;
		}
		
		const data = this.state.sidewalkSummary.sidewalks;
		const formatFunc = (cell) => {
			if (this.state.textDescription) {
				return getRatingDescription(cell);
			}
			return round(cell);
		};
		
		return (
			<div className="sidewalkDetails">
				{this.renderFormatSelection()}
				<BootstrapTable data={data} pagination={data.length > 100} keyField="id" options={{sizePerPage: 100}}>
					<TableHeaderColumn className="lightFontWeight" dataField='id' dataSort>ID</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='comments' dataSort>Comments</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='images' dataSort>Images</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='ratings' dataSort>Ratings</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='accessibility' dataSort dataFormat={formatFunc}>Accessibility</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='connectivity' dataSort dataFormat={formatFunc}>Connectivity</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='comfort' dataSort dataFormat={formatFunc}>Comfort</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='physicalSafety' dataSort dataFormat={formatFunc}>Physical Safety</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='senseOfSecurity' dataSort dataFormat={formatFunc}>Sense of Security</TableHeaderColumn>
					<TableHeaderColumn className="lightFontWeight" dataField='overallRating' dataSort dataFormat={formatFunc}>Overall Rating</TableHeaderColumn>
				</BootstrapTable>
			</div>
		);
	}
	
	/**
	 * Renders the currently selected tab
	 */
	renderSelectedTab() {
		if (this.state.selectedTab === 0) {
			return this.renderContributions();
		}
		return this.renderSidewalkDetails();
	}
	
	render() {
		return (
			<div data-summary-stats className="statsPanel">
				<Paper>
					<Tabs
					  value={this.state.selectedTab}
					  onChange={this._onChangeTab}
					  indicatorColor="primary"
					  textColor="primary"
					  centered
					>
					  <Tab label="Overall Contributions" />
					  <Tab label="Sidewalk Details" />
					</Tabs>
			    </Paper>
				{this.renderSelectedTab()}
			</div>
		)
	}
}