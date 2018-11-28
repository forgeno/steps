import React from "react";
import Drawer from "@material-ui/core/Drawer";
import CloseIcon from "@material-ui/icons/Close";

import LoaderComponent from "../misc-components/LoaderComponent";
import ImageDisplayList from "../misc-components/InfiniteLoadingList";

import Card from '@material-ui/core/Card';

/**
 * This component handles the view where the user can see all of the images posted to a sidewalk
 */
export default class InfiniteImageGallery extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			currentImageIndex: 0
		};
	}
	
	/**
	 * Handles an image being clicked
	 * @param {number} index - the index of the image that was just clicked
	 */
	_onImageClicked = (index) => {
		this.setState({
			currentImageIndex: index
		});
		if(this.props.getImageIndex !== undefined){
			this.props.getImageIndex(index);
		}
	};
	
	/**
	 * Gets whether the specified item is loaded
	 * @param {number} index - the index of the item in the list of all loaded items
	 * @return {boolean} - whether the specified item is loaded
	 */
	_isRowLoaded = ({index}) => {
		return Boolean(this.props.loadedImages[index]);
	};
	
	/**
	 * Loads more items
	 * @param {number} startIndex - the starting index of new items to load
	 * @param {number} stopIndex - the ending index of new items to load
	 */
	_loadMoreRows = ({startIndex, stopIndex}) => {
		// TODO: remove this if statement if using drawer
		if (!startIndex) {
			startIndex = this.props.loadedImages.length;
			stopIndex = startIndex + 1;
		}
		this.props.loadMoreData(startIndex, stopIndex + 4);
	};
	
	/**
	 * Renders the specified item
	 * @param {number} index - the index of the item in the list of loaded items
	 * @param {*} key - the unique key of this item
	 * @param {Object} style - the object's div style to render
	 * @return {JSX} - the item to render
	 */
	_rowRenderer = ({index, key, style}) => {
		let content;
		if (this._isRowLoaded({index})) {
			content = (
				<div className={this.state.currentImageIndex === index ? "infiniteImageRowUnSelected" : "infiniteImageRowUnselected"}>
					<Card className="clickableItem">
						{this.props.renderAboveImage && this.props.renderAboveImage(this.state.currentImageIndex === index, this.props.loadedImages[index])}
						<img onClick={() => {this._onImageClicked(index)}} className="img-responsive fillAvailable" alt="uploaded" src={this.props.loadedImages[index].url} />
					</Card>
				</div>
			);
		} else {
			content = <LoaderComponent />;
		}
		return (
			<div className="infiniteImageListRow" key={key} style={style}>
				{content}
			</div>
		);
	};
	
	/**
	 * Handles a key being pressed
	 * @param {Object} event - the event representing the key press
	 */
	_handleKeyDown = (event) => {
		if (!this.props.visible) {
			return;
		}
		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			if (this.state.currentImageIndex === this.props.loadedImages.length - 1) {
				if (!this.props.hasNextPage) {
					return;
				}
				this._loadMoreRows({
					startIndex: this.state.currentImageIndex + 1,
					stopIndex: this.state.currentImageIndex + 1
				});
			}
			this.setState({
				currentImageIndex: this.state.currentImageIndex + 1
			});
		} else if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && this.state.currentImageIndex > 0) {
			this.setState({
				currentImageIndex: this.state.currentImageIndex - 1
			});
		} else if (event.key === "Escape") {
			this.props.onClose();
		}
	};
	
	renderSelectedImage() {
		let content;
		if (this.props.loadedImages[this.state.currentImageIndex]) {
			content = (
				<img className="backgroundImage"
					alt="selected"
					src={this.props.loadedImages[this.state.currentImageIndex].url} />
			);
		} else {
			content = <LoaderComponent />;
		}
		
		return (
			<div className="selectedImageWrapper">
				{content}
			</div>
		);
	}

	displayImageDrawer() {
		return(
			<div>
				<Drawer open={this.props.visible}
					variant="persistent"
						onClose={this.props.onClose}
						anchor="left"
						SlideProps={{
							unmountOnExit: true
							}}
					>
					{this.renderSelectedImage()}
				</Drawer>
				<Drawer open={this.props.visible}
						variant="persistent"
						onClose={this.props.onClose}
						anchor="right"
						SlideProps={{
							unmountOnExit: true
						}}
					>
					<CloseIcon className="closeButton" onClick={this.props.onClose} />
					<ImageDisplayList isRowLoaded={this._isRowLoaded}
						loadMoreRows={this.props.isNextPageLoading ? () => {} : this._loadMoreRows}
						rowRenderer={this._rowRenderer}
						hasNextPage={this.props.hasNextPage}
						loadedItemCount={this.props.loadedImages.length}
						isNextPageLoading={this.props.isNextPageLoading}
					/>
				</Drawer>
			</div> 
		);
	}
	
	render() {
		return (
			<div className="noOutlineDiv" tabIndex={0} onKeyDown={this._handleKeyDown}>
				{this.displayImageDrawer()}
			</div>
		);
	}
	
}