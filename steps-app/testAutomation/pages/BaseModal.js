import { Selector } from 'testcafe';

/**
 * This class provides base actions for working with any modal
 */
export default class BaseModal {
	
    constructor() {
		this.confirm = Selector(".modal-footer > button").nth(1);
		this.cancel = Selector(".modal-footer > button").nth(0);
		this.modal = Selector(".modal-header");
    }
	
}

