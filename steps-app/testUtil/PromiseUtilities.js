export default class PromiseUtilities {

	static waitUntil(condition, interval = 500) {
		return new Promise((resolve, reject) => {
			const timer = setInterval(() => {
				if (condition()) {
					clearInterval(timer);
					resolve(true);
				}
			}, interval);
		});
	}

}