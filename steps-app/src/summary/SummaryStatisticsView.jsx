import React from "react";
import Reflux from "reflux";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
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

/**
 * Renders summary statistics across all sidewalks
 */
export default class SummaryStatisticsView extends Reflux.Component {

	constructor() {
		super();
		this.stores = [Store, AdminStore];
		this.state = {
			selectedTab: 0
		};
	}

	componentDidMount() {
		Actions.loadSummaryStatistics();
	}
	
	_onChangeTab = (event, value) => {
		this.setState({
			selectedTab: value
		});
	};
	
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
	
	renderContributionsChart() {
		const data = {
			labels: this.state.contributionsByMonth.map((contribution) => {
				const split = contribution.monthYear.split("/");
				return `${DateUtilities.getMonthName(parseInt(split[0]))} ${split[1]}`;
			}),
			datasets: [{
				label: "Contributions By Date",
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
	
	renderSelectedTab() {
		if (!this.state.contributionsByMonth) {
			return <LoaderComponent />;
		}
		return (
			<div data-summary-contributions>
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
	
	render() {
		return (
			<div data-summary-stats className="statsPanel">
				{this.state.hasCSVData && this.state.isLoggedIn && <CSVLink data={this.state.csvFormatted}>
					<Button bsStyle = "primary" className = "csvButton">
						Export CSV
					</Button>
				</CSVLink>}
				{this.renderSelectedTab()}
			</div>
		)
	}
}