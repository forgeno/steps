import React from "react";
import { Component } from "reflux";

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";

import CommentsListComponent from "./CommentsListComponent";
import SidewalkImageDetailsComponent from "./images/SidewalkImageDetailsComponent";
import PedestrianDataComponent from "./PedestrianDataComponent";

import Drawer from "@material-ui/core/Drawer";
import CloseIcon from "@material-ui/icons/Close";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { withStyles } from '@material-ui/core/styles';
import { FONT_FAMILY } from "../constants/ThemeConstants";

const styles = theme => ({
	root: {
		width: '100%',
	},
	heading: {
		fontSize: theme.typography.pxToRem(30),
		fontWeight: theme.typography.fontWeightRegular,
		fontFamily: FONT_FAMILY
	},
});

/**
 * This component handles rendering details about a selected sidewalk
 */
class SidewalkDetailsView extends Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.store = Store;
		this.selfRef = React.createRef();
	}

	componentDidUpdate(prevProps) {
		if (this.props.visible && !prevProps.visible) {
			Actions.loadSidewalkDetails(this.props.selectedSidewalkDetails);
		}
	}

	/**
	 * handles closing of the drawer
	 */
	_handleClose = () => {
		this.props.onClose();
	}

	/**
	 * Handles a key being pressed
	 * @param {Object} event - the event representing the key press
	 */
	_handleKeyDown = (event) => {
		if (event.key === "Escape") {
			this._handleClose();
		}
	};

	renderExpansionPanel(header, component, expanded = false) {
		const { classes } = this.props;
		return (
			<ExpansionPanel defaultExpanded={expanded}>
				<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
					<Typography className={classes.heading}>{header}</Typography>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
					{component}
				</ExpansionPanelDetails>
			</ExpansionPanel>
		);
	}

	/**
	 * Handles rendering summary details about this sidewalk
	 */
	renderSummaryDetails() {
		let imageSection = null;
		if (this.state.currentSidewalk.lastImage) {
			imageSection = (
				<div className="drawerImageSection">
					<img className="img-responsive" alt="sidewalk-preview" src={this.state.currentSidewalk.lastImage.url} />
				</div>
			)
		} else {
			imageSection = <h4>There are no uploaded images for this sidewalk.</h4>;
		}

		return (
			<div>
				<h3 className="streetNameSection">
					{this.state.currentSidewalk.address}
				</h3>
				<hr />
					{imageSection}
				<hr />
				<h5>
					The average pedestrian velocity on this sidewalk is {this.state.currentSidewalk.averageVelocity} metres per second.
				</h5>
			</div>
		);
	}

	renderUploadImageComponent() {
		return <SidewalkImageDetailsComponent onOpenImages={this.props.onOpenImages} />;
	}

	_formatRating(value) {
		return value && value.toFixed(2);
	}

	/**
	 * handles rendering the ratings on the drawer
	 */
	renderRatings() {
		return (
			<div>
				<h4>{this.state.currentSidewalk.totalRatings} people have rated this sidewalk.</h4>
				<hr />
				<h4>Overall: {this._formatRating(this.state.currentSidewalk.overallRating)}</h4>
				<h4>Accessibility: {this._formatRating(this.state.currentSidewalk.accessibility)}</h4>
				<h4>Connectivity: {this._formatRating(this.state.currentSidewalk.connectivity)}</h4>
				<h4>Comfort: {this._formatRating(this.state.currentSidewalk.comfort)}</h4>
				<h4>Physical Safety: {this._formatRating(this.state.currentSidewalk.physicalSafety)}</h4>
				<h4>Sense of Security: {this._formatRating(this.state.currentSidewalk.senseOfSecurity)}</h4>
			</div>
		);
	}

	renderComments() {
		return <CommentsListComponent />;
	}

	renderPedestrianData() {
		if (this.state.currentSidewalk.mobilityTypeDistribution.length === 0) {
			return <h4>No pedestrian data has been recorded for this sidewalk</h4>;
		}
		
		return (
			<PedestrianDataComponent activities={this.state.currentSidewalk.mobilityTypeDistribution} />
		);
	}

	/**
	 * handles rendering the components on the drawer
	 */
	renderDrawerDetails() {
		if (!this.state.currentSidewalk) {
			return null;
		}

		return (
			<div className="sidewalkDrawer">
				{this.renderExpansionPanel("Summary", this.renderSummaryDetails(), true)}
				{this.renderExpansionPanel("Images", this.renderUploadImageComponent())}
				{this.renderExpansionPanel("Ratings", this.renderRatings())}
				{this.renderExpansionPanel("Comments", this.renderComments())}
				{this.renderExpansionPanel("Pedestrian Data", this.renderPedestrianData())}
			</div>
		)
	}

	render() {
		return (
			<div tabIndex={0} onKeyDown={this._handleKeyDown} ref={this.selfRef} className="noOutlineDiv">
				<Drawer open={this.props.visible} anchor="right" variant="temporary">
					<CloseIcon onClick={this._handleClose} className="closeButton" />
					{this.renderDrawerDetails()}
				</Drawer>
			</div>
		);
	}

}

export default withStyles(styles)(SidewalkDetailsView);