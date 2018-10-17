import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

/**
 * This component represents the loading spinner that is displayed when an asynchronous action is performed
 */
export default class LoaderComponent extends React.Component {
	
	render() {
		return <CircularProgress />;
	}
	
}