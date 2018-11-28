
/**
 * Provides utility function for setting up Spam details
 */
export default class SpamUtil {

	/**
	 * Sets up local storage element for the browser with numerical value
	 * @param {String} name of LocalStorage element
	 */
    static setLocalStorage(name){
        if(localStorage[name] === undefined){
			localStorage[name] = 1;
		}
		else {
			localStorage[name] = Number(localStorage[name]) + 1
		}
	}
	
	/**
	 * Sets up local storage with string value
	 * @param {String} name name of the storage
	 * @param {String} value value of the storage
	 */
	static setValueLocalStorage(name, value){
		localStorage.setItem(name, value);
	}

	/**
	 * Returns the value of the local storage 
	 * @param {String} name of the local storage
	 * @returns the local storage value
	 */
    static getLocalStorage(name){
        return localStorage[name];
	}

	/**
	 * Deletes the local storage
	 * @param {String} name of the local storage
	 */
	static deleteLocalStorage(name) {
		localStorage.removeItem(name);
	}


	/**
	 * Creates a cookie with an expiry time given in minutes
	 * @param {String} cname name of the cookie
	 * @param {String} cvalue value of the cookie
	 * @param {Integer} minute how long will the cookie last
	 * @param {String} pathValue what path the cookie is set on
	 */
	static setCookie(cname, cvalue, minute, pathValue) {
		let d = new Date();
		d.setTime(d.getTime() + (minute*60*1000));
		let expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/" + pathValue;
	}
	
	/**
	 * Creates a cookie with an expiry time given in minutes
	 * @param {String} cname name of the cookie
	 * @param {String} cvalue value of the cookie
	 * @param {String} pathValue what path the cookie is set on
	 */
	static setCookieNoExpire(cname, cvalue, pathValue) {
		document.cookie = cname + "=" + cvalue + ";path=/" + pathValue;
	}

	static deleteCookie(name){
		document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	/**
	 * Get the value of the cookie
	 * @param {String} cname cookie name
	 * @returns the value of the cookie
	 */
	static getCookie(cname){
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}
}