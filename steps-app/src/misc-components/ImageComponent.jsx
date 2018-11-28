import React from "react";
import Reflux from "reflux";
import {Thumbnail} from "react-bootstrap";

export default class ImageComponent extends Reflux.Component {
    
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleOnClick = () => {
        this.props.setImageIndex(this.props.index);
        this.props.loadImagesOnClick()
    }

    shouldSelectImageClass() {
        const shouldHighlight = this.props.currentImageIndex === this.props.index ?
            "infiniteImageRowSelected" : "infiniteImageRowUnselected"

        return shouldHighlight;
    }

    render () {

        return( 
            <div className={this.shouldSelectImageClass()}>
                <Thumbnail
                    className="clickableItem previewThumbnail"
                    onClick={this.handleOnClick}
                    src={this.props.src}
                    alt="171x180"
                />
            </div>
        );
    }
}