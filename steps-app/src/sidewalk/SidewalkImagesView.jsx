import React from "react";
import Reflux from "reflux";

import InfiniteImageGallery from "../images/InfiniteImageGallery";
import SidewalkStore from "./SidewalkStore";
import SidewalkActions from "./SidewalkActions";

/**
 * This component handles the view where the user can see all of the images posted to a sidewalk
 */
export default class SidewalkImagesView extends Reflux.Component {
	
	constructor(props) {
		super(props);
		this.store = SidewalkStore;
		this.state = {
			isNextPageLoading: false
		};
	}

	/**
	 * Loads more images to display
	 * @param {number} startIndex - the starting index of new items to load
	 * @param {number} stopIndex - the ending index of new items to load
	 */
	_loadMoreImages = (startIndex, stopIndex) => {
		this.setState({
			isNextPageLoading: true
		});
		SidewalkActions.loadUploadedImages(startIndex, stopIndex, () => {
			this.setState({
				isNextPageLoading: false
			});
		});
	};
	
	render() {
		return <InfiniteImageGallery loadedImages={this.state.loadedUserImages}
					hasNextPage={this.state.hasNextImagesPage}
					loadMoreData={this._loadMoreImages}
					visible={this.props.visible}
					isNextPageLoading={this.state.isNextPageLoading}
					onClose={this.props.onClose}
				/>;
	}
}