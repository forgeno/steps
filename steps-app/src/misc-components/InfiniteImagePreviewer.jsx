import React from "react";
import Reflux from "reflux";
import ImageComponent from "./ImageComponent";

export default class InfiniteImagePreviewer extends Reflux.Component {

    constructor(props) {
        super(props)
        this.state = {
            previewDirection: null,
            start: 0,
            end: 5,
            imageBinIndex: 0,
            currentImageIndex: 0
        }
    }

    previewImagesRow(imagesToPreview) {
        return(
            imagesToPreview.map((image, key) => {
                return(
                    <ImageComponent
                        src={image.url}
                        index={this.state.start + key}
                        currentImageIndex={this.props.currentIndex}
                        key={key}
                        setImageIndex={this.props.setImageIndex}
                        loadImagesOnClick={this.props.loadMoreImages}
                        isNextPageLoading={this.props.loadNextPage}
                    />
                )
            })
        )
    }

    handleRightClick = () => {

        if (this.props.hasMoreImages) {
            this.props.isNextPageLoading();
            this.props.loadMoreByArrow();
        }  
        
        const startIndex = this.state.start + 6,
        endIndex = this.state.end + 6,
        offsetIndex = this.state.imageBinIndex + 1
        this.setState({
            start: startIndex,
            end: endIndex,
            imageBinIndex: offsetIndex,
            previewDirection: "right"
        });
    }

    handleLeftClick = () => {
        const startIndex = (this.state.start - 6) < 0 ? 0 : this.state.start - 6,
            endIndex =  Math.max(0, this.state.end - 6),
            offsetIndex = this.state.imageBinIndex - 1;

        this.setState({
            previewDirection: "left",
            start: startIndex,
            end: endIndex,
            imageBinIndex: offsetIndex
        });
    }

    render() {
        const currentImageIndex = this.props.currentIndex,
            binIndex = this.state.imageBinIndex,
            numPendingImages = this.props.loadedImages.length,
            previewStart = this.state.start,
            previewEnd = this.state.end + 1,
            previewImages = this.props.loadedImages.slice(previewStart, previewEnd),
            shouldShowLeftArrow = !(binIndex === 0),
            shouldShowRightArrow = (binIndex < (Math.ceil(numPendingImages/6)- 1) || this.props.hasMoreImages );

        return(
            <div className="adminPreviewContainer">
                {shouldShowLeftArrow && <div className="arrowLeft previewArrow" onClick={this.handleLeftClick}/>}
                <div className={`imagePreviewer ${binIndex === 0 ? "firstRow" : ""}`}>
                    {this.previewImagesRow(previewImages, currentImageIndex)}
                </div>
                {shouldShowRightArrow && <div className="arrowRight previewArrow" onClick={this.handleRightClick}/>}
            </div>
        );  
    }
}