import React from "react";
import Drawer from "@material-ui/core/Drawer";
import CloseIcon from "@material-ui/icons/Close";

import LoaderComponent from "../misc-components/LoaderComponent";
import ImageDisplayList from "./ImageDisplayList";
import MasonryInfiniteScroller from "react-masonry-infinite";

// TODO: potentially use .data instead of .url for loaded images (depends on which is faster but there is also memory tradeoff)

/**
 * This component handles the view where the user can see all of the images posted to a sidewalk
 */
export default class InfiniteImageGallery extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			currentImageIndex: 0
		};

		this.selfRef = React.createRef();
	}
	
	/**
	 * Handles the window being resized
	 */
	_onResize = () => {
		if (this.props.visible) {
			this.forceUpdate();
		}
	};
	
	componentDidMount() {
		window.addEventListener("resize", this._onResize);
	}
	
	componentDidUpdate(prevProps) {
		if (prevProps.visible !== this.props.visible && this.props.visible) {
			this.selfRef.current.focus();
		}
	}
	
	componentWillUnmount() {
		window.removeEventListener("resize", this._onResize);
	}
	
	/**
	 * Handles an image being clicked
	 * @param {number} index - the index of the image that was just clicked
	 */
	_onImageClicked = (index) => {
		this.setState({
			currentImageIndex: index
		});
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
		this.props.loadMoreData(startIndex, stopIndex);
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
				<div onClick={() => {this._onImageClicked(index)}} className={this.state.currentImageIndex === index ? "infiniteImageRowSelected" : "infiniteImageRowUnselected"}>
					<img className="img-responsive" alt="uploaded"
						width={140}
						src={this.props.loadedImages[index].url} />
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
		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			// TODO: do some testing here
			if (this.state.currentImageIndex === this.props.loadedImages.length - 1) {
				this._loadMoreRows({
					startIndex: this.state.currentImageIndex + 1,
					endIndex: this.state.currentImageIndex + 1
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
		/*if (this.props.loadedImages[this.state.currentImageIndex]) {
			return (
				<img className="backgroundImage"
					alt="selected"
					src={this.props.loadedImages[this.state.currentImageIndex].url} />
			);
		}
		return <LoaderComponent />;*/
		
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
			// TODO: find a way to do this without inline styling. width = 100vw - 250px gives some weird problem
			// where this container is open if the window is maximized
			<div style={{width: window.innerWidth - 250}} className="selectedImageWrapper">
				{content}
			</div>
		);
	}
	
	render() {
		return (
			<div tabIndex={0} onKeyDown={this._handleKeyDown} ref={this.selfRef} className="noOutlineDiv" >
				<Drawer open={this.props.visible}
						variant="persistent"
						onClose={this.props.onClose}
						anchor="left"
					>
					{this.renderSelectedImage()}
				</Drawer>
				<Drawer open={this.props.visible}
						variant="persistent"
						onClose={this.props.onClose}
						anchor="right"
					>
					<CloseIcon className="closeImageListButton" onClick={this.props.onClose} />
					<ImageDisplayList isRowLoaded={this._isRowLoaded}
						loadMoreRows={this.props.isNextPageLoading ? () => {} : this._loadMoreRows}
						rowRenderer={this._rowRenderer}
						hasNextPage={this.props.hasNextPage}
						loadedItemCount={this.props.loadedImages.length}
					/>
				</Drawer>
			</div>
		);
		// TODO: set rendered image width to 200 for this
		/*return (
			<div tabIndex={0} onKeyDown={this._handleKeyDown} ref={this.selfRef} className="noOutlineDiv" >
				{this.renderSelectedImage()}
				<MasonryInfiniteScroller
					hasMore={this.props.hasNextPage}
					loadMore={this.props.isNextPageLoading ? () => {} : this._loadMoreRows}
					sizes={[{ columns: 3, gutter: 0 },
					{ mq: '768px', columns: 4, gutter: 0 },
					{ mq: '1024px', columns: 5, gutter: 0 }]}
				>
					{
						this.props.loadedImages.map((id, index) =>
							this._rowRenderer({index: index, key: index, style: {height: 200, width: 200}})
						)
					}
				</MasonryInfiniteScroller>
				{this.props.isNextPageLoading && <LoaderComponent />}
			</div>
		);*/
	}
	
}