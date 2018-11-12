import React from "react";
import { Component } from 'reflux';

import SummaryMapView from "./SummaryMapView";
import SidewalkDetailsView from "../sidewalk/SidewalkDetailsView";
import SidewalkUploadedImagesGallery from "../sidewalk/images/SidewalkUploadedImagesGallery";
import AlertsContainer from "./AlertsContainer";

import MapStore from "./MapStore";
import MapActions from "./MapActions";

export default class MapDashboard extends Component {

	constructor(props) {
		super(props);
		this.state = {
			viewingImages: false
		};
		this.store = MapStore;
	}

	componentDidMount() {
		if (!this.state.sidewalks || this.state.sidewalks.length === 0) {
			MapActions.loadAllSidewalks();
		}
		MapActions.displaySearch();
	}
	
	componentWillUnmount() {
		MapActions.dismissSearch();
	}
	
	/**
	 * Opens up the uploaded images view
	 */
	_viewImages = () => {
		MapActions.setDrawerOpened(false);
		this.setState({
			viewingImages: true
		});
	};
	
	/**
	 * Closes the uploaded images view
	 * @param {boolean} reopenDrawer - whether the drawer should be reopened or not
	 */
	_closeImages = (reopenDrawer = true) => {
		if (reopenDrawer) {
			MapActions.setDrawerOpened(true);
		}
		this.setState({
			viewingImages: false
		});
	};

	/**
	 * Updates the ratings of the currently selected sidewalk in the list of all sidewalks
	 * @param {Object} sidewalk - details about the sidewalk
	 */
	_updateRatings = (sidewalk) => {
		MapActions.updateSidewalkRatings(sidewalk);
	};
	
	/**
	 * Handles the user closing the drawer
	 */
	_onCloseDrawer = () => {
		this._closeImages(false);
		MapActions.setDrawerOpened(false);
	};
	
	render() {
		return (
			<div>
				<SummaryMapView />
				<SidewalkDetailsView
					visible={this.state.sidewalkSelected}
					onClose={this._onCloseDrawer}
					selectedSidewalkDetails={this.state.selectedSidewalkDetails}
					onOpenImages={this._viewImages}
					updateRatings={this._updateRatings}
				/>
				<SidewalkUploadedImagesGallery onClose={this._closeImages} visible={this.state.viewingImages} />
				<AlertsContainer />
			</div>
		);
	}

}