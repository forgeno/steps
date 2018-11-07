import React from "react";
import Reflux from "reflux";

import InfiniteImageGallery from "../images/InfiniteImageGallery";
import AdminStore from "./AdminStore";
import AdminActions from "./AdminActions";
import {Button} from "react-bootstrap";

export default class AdminDrawerImageGallery extends Reflux.Component {
    constructor(props) {
        super(props);
        this.store = AdminStore;
        this.state = {
        }
        this.imageIndex = 0;
    }
    
    componentDidMount() {
        AdminActions.getUnapprovedImages(0, 5);
     }
     

	loadMoreImages = (startIndex, stopIndex) => {
		this.setState({
			isNextPageLoading: true
		});
        AdminActions.getUnapprovedImages(startIndex, stopIndex, () => {
            setTimeout(() => {
				this.setState({
					isNextPageLoading: false
				});
			}, 50);
        });
    };

    handleAccept = () => {
        const imageId = this.state.pendingImages[this.imageIndex].id;
        AdminActions.handlePendingImages( true, imageId);
    }

    handleReject = () => {
        const imageId = this.state.pendingImages[this.imageIndex].id;
        AdminActions.handlePendingImages(false, imageId);
    }

    getImageIndex = (imageIndex) => {
        this.setState(
            {
                currentImageIndex: imageIndex
            }
        )
        this.imageIndex = imageIndex;
    }
	
	render() {
        if (this.state.pendingImages) {
            const styles = {
                paper: {
                    margin: "65px 0px 0px 0px"
            }
        };
             return (   
                 <div>       
                    <InfiniteImageGallery
                        classes={styles}
                        loadedImages={this.state.pendingImages}
                        hasNextPage={this.state.hasMoreImages}
                        loadMoreData={this.loadMoreImages}
                        visible={true}
                        isNextPageLoading={this.state.isNextPageLoading}
                        getImageIndex={this.getImageIndex}
                    >
                    </InfiniteImageGallery>
                    <div className="buttonContainer">
                        <div>
                            <Button bsStyle="success" onClick={this.handleAccept}> Success </Button>
                        </div>
                        <div>
                            <Button bsStyle="danger" onClick={this.handleReject}> Reject </Button> 
                        </div>       
                    </div>
                </div>
             );
        }
        
        return <h1>No images uploaded</h1>
}
}