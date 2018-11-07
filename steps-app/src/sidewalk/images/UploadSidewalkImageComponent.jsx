import React from "react";
import {Button} from "react-bootstrap";

/**
 * This component represents the "Upload Image" button that is visible on a Sidewalk's details
 */
export default class UploadSidewalkImageComponent extends React.Component {
	
	render() {
		return (
			<Button bsStyle="primary" onClick={this.props.onClick}>
				<span className="glyphicon glyphicon-camera" />
				<span className="uploadSidewalkImageText">
					Upload Image
				</span>
			</Button>
		);
	}
	
}