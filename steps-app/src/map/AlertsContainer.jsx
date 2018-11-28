import React from "react";

import UploadedImageErrorComponent from "../sidewalk/images/UploadedImageErrorComponent";
import UploadedImageSuccessComponent from "../sidewalk/images/UploadedImageSuccessComponent";
import CommentDeleteSuccessComponent from "../sidewalk/comments/CommentDeleteSuccessComponent";
import CommentDeleteErrorComponent from "../sidewalk/comments/CommentDeleteErrorComponent";
import ImageDeleteErrorComponent from "../sidewalk/images/ImageDeleteErrorComponent";
import ImageDeleteSuccessComponent from "../sidewalk/images/ImageDeleteSuccessComponent";
import CommentPostSuccessComponent from "../sidewalk/comments/CommentPostSuccessComponent";
import CommentPostErrorComponent from "../sidewalk/comments/CommentPostErrorComponent";
import PostRatingSuccessComponent from "../sidewalk/PostRatingSuccessComponent";
import PostRatingErrorComponent from "../sidewalk/PostRatingErrorComponent";
import PostRatingSameSidewalk from "../sidewalk/PostRatingSameSidewalk";
import PostRatingThirtyComponent from "../sidewalk/PostRatingThirtyComponent";

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
				<CommentPostErrorComponent />
				<CommentPostSuccessComponent />
				<PostRatingSuccessComponent />
				<PostRatingErrorComponent />
				<PostRatingSameSidewalk/>
				<PostRatingThirtyComponent/>
			</div>
		)
	}

}