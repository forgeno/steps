import React from "react";
import Reflux from "reflux";

import AdminStore from "./AdminStore";
import PendingImagesGallery from "./PendingImagesGallery";

/**
 * This component renders the gallery of all uploaded images that have yet to be approved or rejected
 */
export default class AdminDrawerImageGallery extends Reflux.Component {
	
    constructor(props) {
        super(props);
        this.store = AdminStore;
        this.state = {};
	}
    
    componentDidMount() {
		if (!this.state.isLoggedIn) {
			this.props.history.push('/login');
		}
    }
    
	render() {
		if (!this.state.isLoggedIn) {
			return null;
		}
		const pendingImages = this.state.pendingImages,
			showAdminImages = !(pendingImages.length === 0);

		return (
			<div>
				{!showAdminImages && <h3 className="adminPanelEmptyText"> There are no images to approve or reject.</h3>}
				<PendingImagesGallery />
			</div>

		);
    }
}