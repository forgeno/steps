import React from "react";

import UploadedImageErrorComponent from "../sidewalk/images/UploadedImageErrorComponent";
import UploadedImageSuccessComponent from "../sidewalk/images/UploadedImageSuccessComponent";

export default class AlertsContainer extends React.Component {

	render() {
		return (
			<div>
				<UploadedImageErrorComponent />
				<UploadedImageSuccessComponent />
			</div>
		)
	}

}