import React from "react";

/**
 * This component renders the page that details what the site is about
 */
export default class AboutPageView extends React.Component {

	/**
	 * Renders a topic in the about page
	 * @param {String} title - the title of the topic
	 * @param {String} content - the content describing the topic
	 */
	renderCategory(title, content) {
		return (
			<div>
				<h3>{title}</h3>
				<p>{content}</p>
				<hr />
			</div>
		)
	}

	render() {
		return (
			<div className="padding25">
				{this.renderCategory("About Us", 
					`Steps is a research platform by Space and Culture Research Group, aimed at developing a participatory approach to assess walkability.
					Steps web-app is a tool by Space and Culture and [NAME OF CMPUT TEAM OR YOU CAN BE PART OF OUR S&C TEAM :) ] for collecting perceptions and feedback on walkability. 
					Edmonton residents and visitors can use this map to share their thoughts about the 
					pedestrian network or explore the data collected to date. This information will help identify gaps in pedestrian infrastructure and build the case for improvements.
					`)}
				{this.renderCategory("Instructions", `
					Click on any sidewalk to add data. You can upload pictures, make comments and rate different aspects of walkability. Your information will be stored in the segment that you selected.
					The information collected by this app in entirely anonymous. Pictures and comments will be subject to admin approval.
				`)}
			</div>
		);
	}

}
