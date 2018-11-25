import { Selector } from 'testcafe';

/**
 * This class provides actions for working with popup notifications
 */
export default class Notifications {
	
    constructor() {
		this.text = Selector("#client-snackbar .alertMessage", {timeout: 20000});
    }
	
}

