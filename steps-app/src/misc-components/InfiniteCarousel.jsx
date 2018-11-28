import React from "react";
import Reflux from "reflux";

import {Carousel, Image} from "react-bootstrap";
// import AdminPreviewImages from "./AdminPreviewImages";


/**
 * This component renders the gallery of all uploaded images that have yet to be approved or rejected
 */
export default class InfiniteCarousel extends Reflux.Component {
	
    constructor(props) {
        super(props);
        this.state = {
            direction: null,
            currentImageIndex: 0
        };
    }
    

	handleOnClick = (selectedIndex, event) => {
		this.setState({
			currentImageIndex: selectedIndex,
			direction: event.direction,
		});
        this.props.loadMoreImages();
        this.props.setImageIndex(selectedIndex);
    }

	shouldDisableCarouselArrows(index, length) {
		if (index === 0) {
			return "disableLeftCarouselArrow";
		} else if (index === length - 1) {
			return "disableRightCarouselArrow";
		} else {
			return "";
		}
	}

	render() {
		const imagesToShow = this.props.loadedImages,
			index = this.state.currentImageIndex,
			imageListLength = imagesToShow.length;

		return (   
            <div className={this.shouldDisableCarouselArrows(index, imageListLength)}>
                <Carousel
                    indicators={false}
                    activeIndex={this.state.activeIndex}
                    direction={this.state.direction}
                    interval={null}
                    onSelect={this.handleOnClick}
                >
                    {imagesToShow.map((image, id) => {
                        return (
                        <Carousel.Item key={String(id)}>
                            <Image src={image.url}/>
                        </Carousel.Item>);               
                    })}
                </Carousel>
            </div>
		);
    }
}