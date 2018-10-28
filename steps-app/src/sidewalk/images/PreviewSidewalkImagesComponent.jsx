import React from "react";
import {Button} from "react-bootstrap";

/**
 * This component represents the view where the user can select to see all images uploaded to a sidewalk
 */
export default class PreviewSidewalkImagesComponent extends React.Component {
	
	render() {
		if (this.props.imageCount === 0) {
			return (
				<h5>Nobody has uploaded images yet for this sidewalk.</h5>
			)
		}
		
		return (
			<div className="previewSidewalkImages">
				<Button bsStyle="primary" onClick={this.props.onClick}>
						View {this.props.imageCount} images
				</Button>
			</div>
		);
	}
	
}