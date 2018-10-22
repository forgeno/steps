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
				{this.renderCategory("What is this website about?", 
					`This website was made for the purpose of allowing the citizens of Edmonton to discuss 
					their experiences on sidewalks across the city with other people. As a user of this site, you are able to select any
					sidewalk in the city from the map displayed on the home page. By selecting a sidewalk, you will be
					shown what other people think about that particular sidewalk, through ratings, images, and comments.
					You can leave your own ratings and comments on the sidewalk, as well as upload any image that you
					feel is relevant to the sidewalk.`)}
				{this.renderCategory("Who will use the results?", `
				The results will primarily be used by two parties. The first one is government officials, so they can see
				what sidewalks in the city are in need of improvement the most. STEPS researchers will also use the data collected
				from this website so that they can analyze it to get a bigger picture of the overall state of sidewalks
				in Edmonton.
				`)}
				{this.renderCategory("How can I get involved?", `
				All you need to do to be involved with the STEPS application is to leave your feelings and thoughts
				about particular sidewalks. You can rate any sidewalk you want, comment on it, or even upload an image to it.
				`)}
				{this.renderCategory("Privacy Policy", `
				All of the data collected on this site will be used purely for research purposes. We will never sell any of the
				data we collect to third parties, and nothing that you upload to the site will be directly linked back to you.
				All of your interactions with the site will be anonymous.
				`)}
			</div>
		);
	}

}
