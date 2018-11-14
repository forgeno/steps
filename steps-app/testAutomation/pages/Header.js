import { Selector } from 'testcafe';

export default class Header {
	
    constructor() {
		this.buttons = Selector("header span");
		this.mapButton = this.buttons.withText("STEPS");
		this.aboutButton = this.buttons.withText("ABOUT");
		this.statsButton = this.buttons.withText("STATISTICS");
    }
	
	getLoginButton() {
		return this.buttons.withText("LOGIN");
	}
	
	getAdminButton() {
		return this.buttons.withText("DASHBOARD");
	}
}

