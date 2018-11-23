/**
 * This class provides utilities related to the sidewalk-specific functionality on the application
 */
export default class SidewalkUtilities {

	/**
	 * Generates dummy images to insert into the currently selected sidewalk
	 * @param {Object} t - the testcafe runner
	 */
	static async generateDummyImages(t) {
		await t.eval(() => {
			const TEST_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Images_2015_logo.svg/375px-Google_Images_2015_logo.svg.png";
			const sidewalk = DEV_SIDEWALK_STORE.state.currentSidewalk;
			sidewalk.lastImage = TEST_IMAGE;
			sidewalk.totalImages = 10;
			const images = [];
			for (let i = 0; i < 10; ++i) {
				images.push({url: TEST_IMAGE, id: -99999 + i});
			}
			DEV_SIDEWALK_STORE.setState({currentSidewalk: sidewalk, loadedUserImages: images});
		});
	}

	/**
	 * Gets the number of loaded images for the currently selected sidewalk
	 * @param {Object} t - the testcafe runner
	 * @return {number} - the number of loaded images for the currently selected sidewalk
	 */
	static async getLoadedImagesCount(t) {
		return await t.eval(() => {
			return DEV_SIDEWALK_STORE.state.loadedUserImages.length;
		});
	}
	
	/**
	 * Ensures that there are no images in the currently selected sidewalk
	 * @param {Object} t - the testcafe runner
	 */
	static async forceNoImages(t) {
		await t.eval(() => {
			const sidewalk = DEV_SIDEWALK_STORE.state.currentSidewalk;
			sidewalk.lastImage = null;
			sidewalk.totalImages = 0;
			DEV_SIDEWALK_STORE.setState({currentSidewalk: sidewalk, loadedUserImages: []});
		});
	}
}