import {Selector} from "testcafe";

import config from "../config";
import Header from "../pages/Header";
import MapPage from "../pages/MapPage";
import BrowserUtilities from "../util/BrowserUtilities";
import AdminUtilities from "../util/AdminUtilities";
import StatisticsPage from "../pages/StatisticsPage";

const header = new Header();
const mapPage = new MapPage();
const statsPage = new StatisticsPage();

fixture `Tests navigation with the header`
    .page `${config.baseUrl}`
	.beforeEach(async (t) => {
		await t.click(mapPage.closeButton);
	});

test("going to the about page", async (t) => {
    await t.click(header.aboutButton)
		.expect(BrowserUtilities.getURL()).eql(`${config.baseUrl}/about`)
		.expect(Selector("#root > .App > div.padding25").visible).eql(true);
});

test("going to the statistics page", async (t) => {
	await t.click(header.statsButton)
		.expect(BrowserUtilities.getURL()).eql(`${config.baseUrl}/statistics`)
		.expect(statsPage.stats.visible).eql(true);
});

test("that the admin page does not show up when the user is not logged in", async (t) => {
	if (await header.getAdminButton().exists) {
		throw new Error("The admin button should not exist");
	}
});

// TODO: verify all of these pages actually load with correct content
test("going to the login page", async (t) => {
	await t.click(header.getLoginButton())
		.expect(BrowserUtilities.getURL()).eql(`${config.baseUrl}/login`);
});

test("going to the admin panel", async (t) => {
	await AdminUtilities.silentLogin(t);
	await t.click(header.getAdminButton())
		.expect(BrowserUtilities.getURL()).eql(`${config.baseUrl}/dashboard`);
});

test("that the login page does not show up when the user is logged in", async (t) => {
	await AdminUtilities.silentLogin(t);
	if (await header.getLoginButton().exists) {
		throw new Error("The login button should not exist");
	}
});