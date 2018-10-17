import React from "react";

/**
 * This component represents the view where the user can select to see all images uploaded to a sidewalk
 */
export default class PreviewSidewalkImagesComponent extends React.Component {
	
	render() {
		return (
			<div className="col-md-12" onClick={this.props.onClick}>
				<div className="pull-left">
					<img src={this.props.previewImage} alt="preview" />
				</div>
			   <div className="pull-left">View Images</div>
			</div>
		);
	}
	
}