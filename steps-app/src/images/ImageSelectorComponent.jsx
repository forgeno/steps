import React from "react";
import {Button, FormControl} from "react-bootstrap";

/**
 * This component allows the user to select an image to upload, and it displays the name of the current
 * selected image.
 */
export default class ImageSelectorComponent extends React.Component {

	render() {
		return (
			<div className="row">
				<FormControl
				   readOnly
				   type="text"
				   placeholder={this.props.fileName || "No file selected"}
				 />
				<Button
					onClick={() => this.fileInput.click()}
					bsStyle="primary">
					<div>
						<input
							type="file"
							accept="image/*"
							onChange={this.props.onSelect}
							className="uploadImageInput"
							ref={(fileInput) => {this.fileInput = fileInput;}}
						/>
						<span className="imageComponentButtonText">
							Choose File
						</span>
					</div>
				</Button>
			</div>
		);
	}

}