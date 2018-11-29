import React from "react";

import Drawer from "@material-ui/core/Drawer";
import ImageGallery from 'react-image-gallery';
import { withStyles } from '@material-ui/core/styles';

const PAGE_SIZE = 10;

const styles = theme => ({
  drawer: {
    height: "100vh"
  }
});

/**
 * Renders an infinite amount of images
 */
class InfiniteImageGalleryCarousel extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
		};
		this.galleryRef = React.createRef();
	}
	
	getCurrentIndex = () => {
		return this.galleryRef.current.getCurrentIndex();
	};
	
	_onSelectionChanged = (newIndex) => {
		if (this.props.hasNextPage && !this.props.isNextPageLoading && (this.props.loadedImages.length - newIndex) < 4) {
			this.props.loadMoreData(this.props.loadedImages.length, this.props.loadedImages.length + PAGE_SIZE);
		}
	};
	
	_onImageClicked = (index) => {
		this.galleryRef.current.slideToIndex(index);
	};
	
	/**
	 * Handles a key being pressed
	 * @param {Object} event - the event representing the key press
	 */
	_handleKeyDown = (event) => {
		if (!this.props.visible) {
			return;
		}
		if (event.key === "Escape") {
			this.props.onClose();
		}
	};
	
	_renderCustomControls = () => {
		if (!this.props.renderAboveImage) {
			return null;
		}
		return (
			<div className="imageCarouselControls">
				{this.props.renderAboveImage()}
			</div>
		);
	};
	
	renderCarousel() {
		const images = this.props.loadedImages.filter((item) => item).map((item) => {
			return {
				original: item.url,
				thumbnail: item.url,
				sizes: "800px",
				originalClass: "img-responsive"
			};
		});
		return (
		  <ImageGallery items={images}
						infinite={false}
						lazyLoad
						showPlayButton={false}
						ref={this.galleryRef}
						renderCustomControls={this._renderCustomControls}
						onSlide={this._onSelectionChanged}
						thumbnailPosition="top"
						showFullscreenButton={false}
		  />
		);
	}
	
	render() {
		if (this.props.noDrawer) {
			return (
				<div className="noOutlineDiv" tabIndex={0} onKeyDown={this._handleKeyDown}>
					{this.renderCarousel()}
				</div>
			)
		}
		
		const {classes} = this.props;
		return (
			<div className="noOutlineDiv" tabIndex={0} onKeyDown={this._handleKeyDown}>
				<Drawer open={this.props.visible}
					variant="persistent"
					onClose={this.props.onClose}
					anchor="bottom"
					SlideProps={{
						unmountOnExit: true
					}}
					classes={{
						paper: classes.drawer,
					}}
					>
					{this.renderCarousel()}
				</Drawer>
			</div>
		);
	}
}

export default withStyles(styles)(InfiniteImageGalleryCarousel);