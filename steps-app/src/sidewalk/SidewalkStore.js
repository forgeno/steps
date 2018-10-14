import Reflux from "reflux";
import Actions from "./SidewalkActions";

/**
 * This store keeps track of the state of components that deal with sidewalks
 */
export default class SidewalkStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {};
        this.listenables = Actions;
    }

	/**
	 * Handles the user selecting an image to upload to a sidewalk
	 * @param {String} base64Image - the image as a base64 string
	 */
	onUploadSidewalkImage(base64Image) {
		// TODO: upload image to database using REST util
		this.setState({
			upload: base64Image
		});
	}
	
}