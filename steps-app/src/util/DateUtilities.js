import moment from "moment";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
		return moment(date).format("MMMM DD, YYYY - h:mm A")
	}

	/**	
	 * Gets the name of the month matching the specified month number	
	 * @param {number} monthNumber - the month number to get the name of (1 - 12)	
	 * @return {String} - the name of the month matching the specified month number	
	 */	
	static getMonthName(monthNumber) {	
		return months[monthNumber - 1];	
	}
}