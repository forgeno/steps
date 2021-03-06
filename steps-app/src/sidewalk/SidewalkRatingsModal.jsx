import React from "react";
import { Component } from "reflux";

import Slider from '@material-ui/lab/Slider';
import {Button, Tooltip, OverlayTrigger} from "react-bootstrap";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { withStyles } from '@material-ui/core/styles';

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";
import LoaderComponent from "../misc-components/LoaderComponent";
import {getRatingDescription} from "../util/RatingUtil";
import { FONT_FAMILY } from "../constants/ThemeConstants";
import SpamUtil from "../util/SpamUtil";
import {ACCESSIBILITY, CONNECTIVITY, COMFORT, SAFETY, SECURITY} from "../constants/RatingsDescriptionConstants";

const styles = theme => ({
	root: {
		width: "90%",
		overflowX: "hidden"
	},
	slider: {
        padding: '15px',
	},
	
	heading: {
		fontSize: theme.typography.pxToRem(30),
		fontWeight: theme.typography.fontWeightRegular,
		fontFamily: FONT_FAMILY
	},
});

/**
 * This component handles rendering the components that allow rating sidewalks
 */
class SidewalkRatingsModal extends Component {
	
	constructor() {
		super();
		this.store = Store;
		this.state = {
			accessibilityValue: 3,
			connectivityValue: 3,
			comfortValue: 3,
			safetyValue: 3,
			securityValue: 3
		};
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
	 * Handles changes when submit rating button is clicked
	 */
	_handleSubmitRating = () => {
		SpamUtil.setLocalStorage("NumberSidewalk");
		if (Number(SpamUtil.getLocalStorage("NumberSidewalk")) === 1){
			SpamUtil.setCookie("timer", "true", 0.5, "");
		}
		SpamUtil.setCookie(this.state.currentSidewalk.id, "true", 60, "");
		
		Actions.uploadRatings(
			this.state.accessibilityValue,
			this.state.comfortValue,
			this.state.connectivityValue,
			this.state.safetyValue,
			this.state.securityValue,
			() => {
				this.setState({
					accessibilityValue: 3, 
					connectivityValue: 3,
					comfortValue: 3,
					safetyValue: 3,
					securityValue: 3
				});
				this.props.onClose(true);
			}
		);
	}

	_submitStatus = () => {
		return this.state.ratingStatus
	}
	
	renderSlider(classes, value, onChange, name, tooltipDescription) {
		const tooltip = (
			<Tooltip 
				id={name}>
				{tooltipDescription}
			</Tooltip>
		);

		return (
			<div>
				<OverlayTrigger placement="top" overlay={tooltip}>
					<h5 className="ratingsHeader">
						{name}
					</h5>
				</OverlayTrigger>
				<div className="ratingSlider">
					<div className={classes.root}>
						<Slider
							classes={{ container: classes.slider }}
							value={value}
							min={1}
							max={5}
							step={1}
							onChange={onChange}
						/>
					</div>
					<span style={{paddingLeft: "15px"}}>
						{getRatingDescription(value)}
					</span>
				</div>
			</div>
		)
	}
	
	renderBody() {
		const { classes } = this.props;
		return (
			<div>
				{this.renderSlider(classes, this.state.accessibilityValue, this.changeAccessibility, "Accessibility", ACCESSIBILITY)}
				{this.renderSlider(classes, this.state.connectivityValue, this.ChangeConnectivity, "Connectivity", CONNECTIVITY)}
				{this.renderSlider(classes, this.state.comfortValue, this.changeComfort, "Comfort", COMFORT)}
				{this.renderSlider(classes, this.state.safetyValue, this.changeSafety, "Physical Safety", SAFETY)}
				{this.renderSlider(classes, this.state.securityValue, this.changeSecurity, "Sense of Security", SECURITY)}
			</div>
		);
	}
	
	render() {
		const { classes } = this.props;
		return (
			<Dialog
				open={this.props.open}
				onClose={this.props.onClose}
			>
				<div className={classes.paper}>
					<h4 className="modal-title">Rate Sidewalk</h4>
					<DialogContent>
						{this.state.isUploadingRatings && <LoaderComponent />}
						{this.renderBody()}
					</DialogContent>
					<DialogActions>
						<Button onClick={this.props.onClose}>
							Cancel
						</Button>
						<Button bsStyle="primary" type="submit" onClick={this._handleSubmitRating} disabled={!this._submitStatus()}>
							Submit
						</Button>
					</DialogActions>
				</div>
			</Dialog>
		);
	}
}

export default withStyles(styles)(SidewalkRatingsModal);