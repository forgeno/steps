import { ClientFunction } from 'testcafe';

export default class BrowserUtilities {

	static getURL() {
		return ClientFunction(() => document.location.href)();
	}

}