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
				password: "stepsSix"
			});
		});
	}

}