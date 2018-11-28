/**
 * This class provides utilities related to the administrator-specific functionality on the application
 */
export default class AdminUtilities {

	/**
	 * Directly logs into the application without validating a username or password
	 * @param {Object} t - the testcafe runner
	 */
	static async silentLogin(t) {
		await t.eval(() => {
			window.DEV_ADMIN_STORE.setState({
				isLoggedIn: true,
				username: "stepsAdmin",
				password: "716481e86d31433e772f52de60b915c4"
			});
		});
	}

	static async generateAdminDummyImages(t) {
		await t.eval(() => {
			const TEST_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Images_2015_logo.svg/375px-Google_Images_2015_logo.svg.png";
			const pendingImagesMock  = DEV_ADMIN_STORE.state.pendingImages;
			const images = [];
			for (let i = 0; i < 5; ++i) {
				images.push({url: TEST_IMAGE, id: -99999 + i, sidewalk: {id: "2", type: "Sidewalk"}});
			}
			DEV_ADMIN_STORE.setState({
				pendingImages: images,
				hasMoreImages: false});
		});
	}

	static async generateAdminDummyErrorImages(t) {
		await t.eval(() => {
			const TEST_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Images_2015_logo.svg/375px-Google_Images_2015_logo.svg.png";
			const images = [];
			images.push({url: TEST_IMAGE, id: 9001, sidewalk: {}});
			DEV_ADMIN_STORE.setState({
				pendingImages: images,
				hasMoreImages: false});
		});
	}
}