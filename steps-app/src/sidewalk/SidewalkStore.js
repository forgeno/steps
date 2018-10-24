import Reflux from "reflux";

import Actions from "./SidewalkActions";
import RestUtil from "../util/RestUtil";

/**
 * This store keeps track of the state of components that deal with sidewalks
 */
export default class SidewalkStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {
			loadedUserImages: [],
			hasNextImagesPage: true,
			currentSidewalk: null,
			uploadingSidewalkImage: false,
			uploadedImageError: false
		};
        this.listenables = Actions;
    }

	/**
	 * Loads the specified sidewalk
	 * @param {Object} sidewalk - a basic sumamry of the sidewalk to load, including it's id and average ratings
	 */
	onLoadSidewalkDetails(sidewalk) {
		RestUtil.sendGetRequest(`sidewalk/${sidewalk.id}`).then((data) => {
			const newSidewalk = Object.assign({}, sidewalk, data);
			this.setState({
				currentSidewalk: newSidewalk
			});
		}).catch((err) => {
			console.error(err);
		});
	}
	
	/**
	 * Handles the user selecting an image to upload to a sidewalk
	 * @param {String} base64Image - the image as a base64 string
	 */
	onUploadSidewalkImage(base64Image) {
		this.setState({
			uploadingSidewalkImage: true,
			uploadedImageError: false
		});
		
		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/image/create`, {
			image: base64Image
		}).then(() => {
			this.setState({
				uploadingSidewalkImage: false,
				uploadedImageError: false
			});
		}).catch((err) => {
			this.setState({
				uploadingSidewalkImage: false,
				uploadedImageError: true
			});
			console.error(err);
		});
	}
	
	/**
	 * Loads user uploaded images from the database
	 * @param {number} startIndex - the amount of images to skip before starting to return them
	 * @param {number} startIndex - the index of the last item to load
	 * @param {function} updateStateCallback - a callback function that will be invoked when the images are loaded
	 */
	onLoadUploadedImages(startIndex, stopIndex, updateStateCallback) {
		RestUtil.sendPostRequest(`sidewalk/${this.state.currentSidewalk.id}/image`, {
			startIndex: startIndex,
			endIndex: stopIndex
		}).then((res) => {
			// TODO: potentially fetch data for each new loaded image and assign to data attribute
			this.setState({
				hasNextImagesPage: res.hasMoreImages,
				loadedUserImages: this.state.loadedUserImages.slice(0).concat(res.images)
			});
			updateStateCallback();
		}).catch((err) => {
			console.error(err);
		});
	}

}