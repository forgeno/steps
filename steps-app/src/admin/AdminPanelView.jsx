import React from "react";
import Reflux from "reflux";

import InfiniteImageGallery from "../images/InfiniteImageGallery";
import AdminStore from "./AdminStore";
import AdminActions from "./AdminActions";

export default class AdminDrawerImageGallery extends Reflux.Component {
    constructor(props) {
        super(props);
        this.store = AdminStore;
        this.state = {
        }
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
	
	render() {
        if (this.state.pendingImages) {
            const styles = {
				paper: {
					margin: "65px 0px 0px 0px"
            }
		};

            return (            
                <InfiniteImageGallery
                    classes={styles}
                    loadedImages={this.state.pendingImages}
                    hasNextPage={this.state.hasMoreImages}
                    loadMoreData={this.loadMoreImages}
                    visible={true}
                    isNextPageLoading={this.state.isNextPageLoading}
            />);
        }
        
        return <h1>No images uploaded</h1>
	}
}