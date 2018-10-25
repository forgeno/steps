const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Gets the time component of the specified date in HH:MM format
 * @param {Date} date - the date to format
 * @return {String} - the outputted time of the date in HH:MM format
 */
const getTimeDisplay = (date) => {
	const hours = ("0" + date.getHours()).slice(-2);
	const minutes = ("0" + date.getMinutes()).slice(-2);
	return hours + ":" + minutes;
};

/**
 * Provides utility functions for working with dates
 */
export default class DateUtilities {

	/**
	 * Formates a date object for display on the UI
	 * @param {Date} date - the date to format
	 * @return {String} - the formatted date to display
	 */
	static formatDateForDisplay(date) {
		return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " - " + getTimeDisplay(date);
	}

}