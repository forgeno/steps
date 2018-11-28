import React from "react";
import { Component } from "reflux";
import SidewalkStore from "./SidewalkStore";
import AdminStore from "../admin/AdminStore";

import SidewalkActions from "./SidewalkActions";
import CommentsListComponent from "./comments/CommentsListComponent";
import SidewalkImageDetailsComponent from "./images/SidewalkImageDetailsComponent";
import PedestrianDataComponent from "./PedestrianDataComponent";
import SidewalkRatingsModal from "./SidewalkRatingsModal";
import {getRatingDescription} from "../util/RatingUtil";
import {CSVLink, CSVDownload} from 'react-csv';

import Drawer from "@material-ui/core/Drawer";
import CloseIcon from "@material-ui/icons/Close";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import { withStyles } from '@material-ui/core/styles';
import { FONT_FAMILY } from "../constants/ThemeConstants";
import { Button } from "react-bootstrap";

const styles = theme => ({
	root: {
		width: '90%',
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
		this.state = {
			ratingsModalOpen: false
		};
		this.stores = [SidewalkStore, AdminStore];
		this.selfRef = React.createRef();

	}

	componentDidUpdate(prevProps) {
		if (this.props.visible && !prevProps.visible && this.props.selectedSidewalkDetails) {
			SidewalkActions.loadSidewalkDetails(this.props.selectedSidewalkDetails);
		}
	}

	componentDidMount() {
		
	}

	getCSVData = () => {
		SidewalkActions.downloadSidewalkCSV(this.state.currentSidewalk.id);
		
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
				<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} data-sidewalk-header={header}>
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

		let velocityText;
		if (this.state.currentSidewalk.averageVelocity > 0) {
			velocityText = `The average pedestrian velocity on this sidewalk is ${this.state.currentSidewalk.averageVelocity} metres per second.;`;
		} else {
			velocityText = "No data has been recorded for the average pedestrian velocity of this sidewalk.";
		}
		
		return (
			<div>
				<h3 className="streetNameSection">
					{this.state.address}
				</h3>
				<hr />
					{imageSection}
				<hr />
				<h5>
					{velocityText}
					<div class="text-center">
						{this.state.isLoggedIn && this.state.sidewalkHasCSVData && <CSVLink data={this.state.sidewalkCsvFormatted}>
							<Button bsStyle = "primary" className = "sidewalkCsvButton">
								EXPORT SIDEWALK CSV
							</Button>
						</CSVLink>}
					</div>
				</h5>
			</div>
		);
	}

	renderUploadImageComponent() {
		return <SidewalkImageDetailsComponent onOpenImages={this.props.onOpenImages} />;
	}

	_formatRating(value) {
		return value ? getRatingDescription(value) : "-";
	}

	_openRatingsModal = () => {
		this.setState({ ratingsModalOpen: true });
	};

	/**
	 * Closes the ratings modal
	 * @param {boolean} postedRating - whether the user posted a rating to the sidewalk successfully or not
	 */
	_closeRatingsModal = (postedRating) => {
		if (postedRating) {
			SidewalkActions.getSidewalkRatings(() => {this.props.updateRatings(this.state.currentSidewalk);});
		}
		this.setState({ ratingsModalOpen: false });
	};
	
	renderRatingsAmount = () => {
		if (this.state.currentSidewalk.totalRatings === 1) {
			return <h4>1 person has rated this sidewalk.</h4>
		}
		return <h4>{this.state.currentSidewalk.totalRatings} people have rated this sidewalk.</h4>
	}
	
	/**
	 * handles rendering the ratings on the drawer
	 */
	renderRatings() {
		return (
			<div >
				<Button bsStyle="primary" onClick={this._openRatingsModal}>Rate this sidewalk</Button>
				<SidewalkRatingsModal open={this.state.ratingsModalOpen} onClose={this._closeRatingsModal} />
				{this.renderRatingsAmount()}
				<hr />
				<h4>Overall: {this._formatRating(this.state.currentSidewalk.overallRating)}</h4>
				<h4>Accessibility: {this._formatRating(this.state.currentSidewalk.accessibility)}</h4>
				<h4>Connectivity: {this._formatRating(this.state.currentSidewalk.connectivity)}</h4>
				<h4>Comfort: {this._formatRating(this.state.currentSidewalk.comfort)}</h4>
				<h4>Physical Safety: {this._formatRating(this.state.currentSidewalk.physicalSafety)}</h4>
				<h4>Sense of Security: {this._formatRating(this.state.currentSidewalk.senseOfSecurity)}</h4>
			</div >
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

		if (!this.state.sidewalkHasCSVData) {
			this.getCSVData();
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
				<Drawer open={this.props.visible}
						anchor="right"
						variant="temporary"
						ModalProps={{ onBackdropClick: this._handleClose }}
						>	
					<div className="closeButton">
					<CloseIcon onClick={this._handleClose}  />
					</div>	
					{this.renderDrawerDetails()}
				</Drawer>
			</div>
		);
	}

}

export default withStyles(styles)(SidewalkDetailsView);