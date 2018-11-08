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
import Slider from '@material-ui/lab/Slider';
import { withStyles } from '@material-ui/core/styles';
import { FONT_FAMILY } from "../constants/ThemeConstants";
import { Button } from "react-bootstrap";
// import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { AssertionError } from "assert";


const styles = theme => ({
	root: {
		width: '90%',
	},
	slider: {
        padding: '22px 0px',
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
			accessibilityValue: 3, 
			connectivityValue: 3,
			comfortValue: 3,
			safetyValue: 3,
			securityValue: 3,
			open: false };
		this.store = Store;
		this.selfRef = React.createRef();

	}

	componentDidUpdate(prevProps) {
		if (this.props.visible && !prevProps.visible && this.props.selectedSidewalkDetails) {
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
	 * Hendles change of user rating
	 */
	changeAccessibility = (event, accessibilityValue) => {
		this.setState({ accessibilityValue });
	};
	
	ChangeConnectivity = (event, connectivityValue) => {
		this.setState({ connectivityValue });
	};

	changeComfort = (event, comfortValue) => {
		this.setState({ comfortValue });
	};

	changeSafety = (event, safetyValue ) => {
		this.setState({ safetyValue });
	};

	changeSecurity = (event, securityValue) => {
		this.setState({ securityValue });
	};

	/**
	 * Handles changes when rating button is clicked
	 */

	handleClickOpen = () => {
		this.setState({ open: true });
	  };

	/**
	 * Handles changes when close rating button is clicked
	 */
	handleClose = () => {
		this.setState({ open: false });
	};

	/**
	 * Handles changes when submit rating button is clicked
	 */
	_handleSubmitRating = (e) => {
		Actions.uploadRatings(
			this.state.accessibilityValue,
			this.state.comfortValue,
			this.state.connectivityValue,
			this.state.safetyValue,
			this.state.securityValue);
		this.setState({
			accessibilityValue: 3, 
			connectivityValue: 3,
			comfortValue: 3,
			safetyValue: 3,
			securityValue: 3,
			open: false 
		});
	}

	/**
	 * handles rendering the ratings on the drawer
	 */
	renderRatings() {
		const { classes } = this.props;
		const { accessibilityValue } = this.state;
		const { connectivityValue } = this.state;
		const { comfortValue } = this.state;
		const { safetyValue } = this.state;
		const { securityValue } = this.state;
		
		return (
			<div >
				<Button bsStyle="primary" onClick={this.handleClickOpen}>Rate this sidewalk</Button>
				<Dialog
					//className="dialogFormat"
					open={this.state.open}
					onClose={this.handleClose}
					aria-labelledby="form-dialog-title"
				>
					<DialogTitle id="form-dialog-title">Rate Sidewalk</DialogTitle>
					<DialogContent>
						<h5> Accessibility </h5>
						<div className="ratingSlider">
							<div className={classes.root}>
								<Slider
									classes={{ container: classes.slider }}
									value={accessibilityValue}
									min={1}
									max={5}
									step={1}
									onChange={this.changeAccessibility}
								/>
							</div>
							{accessibilityValue}/5
						</div>

						<h5> Connectivity </h5>
						<div className="ratingSlider">
							<div className={classes.root}>
								<Slider
									classes={{ container: classes.slider }}
									value={connectivityValue}
									min={1}
									max={5}
									step={1}
									onChange={this.ChangeConnectivity}
									
								/>
							</div>
							{connectivityValue}/5
						</div>

						<h5> Comfort </h5>
						<div className="ratingSlider">
							<div className={classes.root}>
								<Slider
									classes={{ container: classes.slider }}
									value={comfortValue}
									min={1}
									max={5}
									step={1}
									onChange={this.changeComfort}
								/>
							</div>
							{comfortValue}/5
						</div>
						
						<h5> Physical Safety </h5>
						<div className="ratingSlider">
							<div className={classes.root}>
								<Slider
									classes={{ container: classes.slider }}
									value={safetyValue}
									min={1}
									max={5}
									step={1}
									onChange={this.changeSafety}
								/>
							</div>
							{safetyValue}/5
						</div>
						
						<h5> Sense of Security </h5>
						<div className="ratingSlider">
							<div className={classes.root}>
								<Slider
									classes={{ container: classes.slider }}
									value={securityValue}
									min={1}
									max={5}
									step={1}
									onChange={this.changeSecurity}
								/>
							</div>
							{securityValue}/5
						</div>
						
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleClose}>
							Cancel
            			</Button>
						<Button bsStyle="primary" onClick={this._handleSubmitRating}>
							Submit
            			</Button>
					</DialogActions>
				</Dialog>


				<h4>{this.state.currentSidewalk.totalRatings} people have rated this sidewalk.</h4>
				
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