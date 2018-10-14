export const
	/**
	 * Converts bytes into megabytes
	 * @param {number} bytes - the amount in bytes to convert
	 * @return {number} - the input bytes value represented in megabytes form
	 */
	bytesToMB = (bytes) => {
		return bytes / 1048576;
	},
	/**
	 * Gets a base64 encoded string of a file that a user has selected to upload
	 * @param {Object} file - the file that the user has selected
	 * @return {Promise} - a promise that resolves with the base64 string
	 */
	getFile = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = (err) => {
				reader.abort();
				reject(err);
			};
			reader.onload = function() {
				resolve(this.result);
			};
			reader.readAsDataURL(file);
		});
	};