import React from "react";
import { Component } from "reflux";
import { Alert } from "react-bootstrap";

import Store from "./SidewalkStore";
import Actions from "./SidewalkActions";

import ImageUploadModal from "../images/ImageUploadModal";
import UploadSidewalkImageComponent from "./UploadSidewalkImageComponent";
import PreviewSidewalkImagesComponent from "./PreviewSidewalkImagesComponent";
import SidewalkImagesView from "./SidewalkImagesView";
import LoaderComponent from "../misc-components/LoaderComponent";

import Drawer from "@material-ui/core/Drawer";
import CloseIcon from "@material-ui/icons/Close";
import { Button, FormGroup, ControlLabel, FormControl } from "react-bootstrap";
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
		this.state = {
			modalOpened: false,
			viewingImages: false,
			value: '',
			sidewalkDetails: null,
		};
		this.store = Store;
		this.selfRef = React.createRef();
	}

	componentDidUpdate(prevProps) {
		if (this.props.visible && !prevProps.visible) {
			Actions.loadSidewalkDetails(this.props.selectedSidewalkDetails);
		}
	}

	/**
	 * Opens the modal allowing the user to upload images
	 */
	_openImageModal = () => {
		this.setState({
			modalOpened: true
		});
	};

	/**
	 * Closes the image upload modal
	 * @param {String?} - the base64 encoded string representing the image the user uploaded if valid, or undefined otherwise
	 */
	_closeImageModal = (uploadedFile) => {
		this.setState({
			modalOpened: false
		});
		if (uploadedFile) {
			Actions.uploadSidewalkImage(uploadedFile);
		}
	};

	/**
	 * Opens up the uploaded images view
	 */
	_viewImages = () => {
		this.setState({
			viewingImages: true
		});
	};

	/**
	 * Closes the uploaded images view
	 */
	_closeImages = () => {
		this.setState({
			viewingImages: false
		});
	};

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
					<img src={this.state.currentSidewalk.lastImage} />
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

	/**
	 * handles interactions and rendering the button for uploading images
	 */
	renderUploadImageComponent() {
		return (
			<div className="imageButtonDisplay">
				<UploadSidewalkImageComponent onClick={() => this.fileInput.click()} />
				<div>
					<input
						type="file"
						accept="image/*"
						onChange={this.props.onSelect}
						className="uploadImageInput"
						ref={(fileInput) => { this.fileInput = fileInput; }}
					/>
				</div>
				{
					this.state.uploadedImageError && (
						<Alert bsStyle="danger">
							An error occurred while uploading the image.
							</Alert>
					)
				}
				{
					this.state.uploadingSidewalkImage && (
						<div>
							<span>Uploading</span>
							<LoaderComponent />
						</div>
					)
				}
				<PreviewSidewalkImagesComponent previewImage="" onClick={this._viewImages} />
				<ImageUploadModal visible={this.state.modalOpened} onClose={this._closeImageModal} />
				<SidewalkImagesView onClose={this._closeImages} visible={this.state.viewingImages} />
			</div>
		);
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

	getCommentLength() {
		const length = this.state.value.length;
		if (length <= 300) return 'success';
		else if (length > 300) return 'error';
		return null;
	}

	handleChange = (e) => {
		this.setState({ 
			value: e.target.value 
		});
	}

	handleSubmit = (e) => {
		const commentString = this.state.value;
		Actions.uploadComment(commentString);
	}

	renderComments() {
		const comments = this.state.currentSidewalk.comments;

		return (
			<div>
				<div className="commentUploadSection">
					<div className="commentBox">
						<form>
							<FormGroup
								bsSize="small"
								controlId="formBasicText"
								validationState={this.getCommentLength()}
							>
								<FormControl
									type="text"
									value={this.state.value}
									placeholder="Enter text"
									onChange={this.handleChange}
								/>
								<FormControl.Feedback />
							</FormGroup>
						</form>
					</div>
					<Button bsStyle="info" onClick={this.handleSubmit}>
						Confirm
				</Button>
				</div>
				<br />

				<div className="commentDisplaySection">
					<h3> User comments </h3>
					<div >
						{comments.map((item, index) =>
							<div className="commentDisplayBox" key={index}>
								<h5>{item.text}</h5>
								<h6>{item.date}</h6>

							</div>
						)}
					</div>
				</div>
			</div >

		);
	}


	renderPedestrianData() {
		if (this.state.currentSidewalk.mobilityTypeDistribution.length === 0) {
			return <h4>No pedestrian data has been recorded for this sidewalk</h4>;
		}
		return (
			<div>
				{
					this.state.currentSidewalk.mobilityTypeDistribution.map((mobilityType) => {
						return (
							<p>{mobilityType.type}</p>
						);
					})
				}
			</div>
		)
	}

	/**
	 * handles rendering the components on the drawer
	 */
	renderDrawerDetails() {
		if (!this.state.currentSidewalk) {
			return null;
		}

		return (
			<div>
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
					<CloseIcon onClick={this._handleClose} className="closeImageListButton" />
					{this.renderDrawerDetails()}
				</Drawer>
			</div>
		);
	}

}

export default withStyles(styles)(SidewalkDetailsView);