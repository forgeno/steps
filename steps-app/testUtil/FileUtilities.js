const fs = require("fs");

export default class FileUtilities {

	/**
	 * Gets a base64 encoded representation of the specified file
	 * @param {String} filePath - the path to the file
	 * @return {String} - the base64 encoded string representing the file contents
	 */
	static getBase64Encoding(filePath) {
		return new Buffer(fs.readFileSync(filePath)).toString("base64");
	}

}