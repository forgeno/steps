import React from "react";
import Loader from "react-spinners/FadeLoader";

/**
 * This component represents the loading spinner that is displayed when an asynchronous action is performed
 */
export default class LoaderComponent extends React.Component {
	
	render() {
		return <Loader
			  sizeUnit={"px"}
			  color={"#123abc"}
			  loading={true}
			/>;
	}
	
}