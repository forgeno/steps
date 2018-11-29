import { Selector } from 'testcafe';

export default class Header {
	
    constructor() {
		this.buttons = Selector("header span");
		this.mapButton = this.buttons.withText("STEPS");
		this.aboutButton = this.buttons.withText("ABOUT");
		this.statsButton = this.buttons.withText("STATISTICS");
    }
	
	getLogoutButton() {
		return Selector("button span").withText("LOGOUT");
	}
	
	getAdminButton() {
		return this.buttons.withText("DASHBOARD");
	}
}

