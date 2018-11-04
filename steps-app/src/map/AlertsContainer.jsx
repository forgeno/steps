import React from "react";

import UploadedImageErrorComponent from "../sidewalk/images/UploadedImageErrorComponent";
import UploadedImageSuccessComponent from "../sidewalk/images/UploadedImageSuccessComponent";
import CommentDeleteSuccessComponent from "../sidewalk/CommentDeleteSuccessComponent";
import CommentDeleteErrorComponent from "../sidewalk/CommentDeleteErrorComponent";

export default class AlertsContainer extends React.Component {

	render() {
		return (
			<div>
				<UploadedImageErrorComponent />
				<UploadedImageSuccessComponent />
				<CommentDeleteSuccessComponent />
				<CommentDeleteErrorComponent />
			</div>
		)
	}

}