import React from "react";

import UploadedImageErrorComponent from "../sidewalk/images/UploadedImageErrorComponent";
import UploadedImageSuccessComponent from "../sidewalk/images/UploadedImageSuccessComponent";
import CommentDeleteSuccessComponent from "../sidewalk/CommentDeleteSuccessComponent";
import CommentDeleteErrorComponent from "../sidewalk/CommentDeleteErrorComponent";
import ImageDeleteErrorComponent from "../sidewalk/images/ImageDeleteErrorComponent";
import ImageDeleteSuccessComponent from "../sidewalk/images/ImageDeleteSuccessComponent";

/**
 * Renders any alerts that the user may see
 */
export default class AlertsContainer extends React.Component {

	render() {
		return (
			<div>
				<UploadedImageErrorComponent />
				<UploadedImageSuccessComponent />
				<CommentDeleteSuccessComponent />
				<CommentDeleteErrorComponent />
				<ImageDeleteErrorComponent />
				<ImageDeleteSuccessComponent />
			</div>
		)
	}

}