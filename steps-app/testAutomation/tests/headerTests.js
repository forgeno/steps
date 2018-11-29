import {Selector} from "testcafe";

import config from "../config";
import Header from "../pages/Header";
import BrowserUtilities from "../util/BrowserUtilities";
import AdminUtilities from "../util/AdminUtilities";
import StatisticsPage from "../pages/StatisticsPage";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

const header = new Header();
const statsPage = new StatisticsPage();
const loginPage = new LoginPage();
const adminPage = new AdminDashboardPage();

fixture `Tests navigation with the header`
    .page `${config.baseUrl}`;

test("going to the about page", async (t) => {
    await t.click(header.aboutButton)
		.expect(BrowserUtilities.getURL()).eql(`${config.baseUrl}/about/`)
		.expect(Selector("#root > .App > div.padding25").visible).eql(true);
});

test("going to the statistics page", async (t) => {
	await t.click(header.statsButton)
		.expect(BrowserUtilities.getURL()).eql(`${config.baseUrl}/statistics/`)
		.expect(statsPage.stats.visible).eql(true);
});

test("that the admin page does not show up when the user is not logged in", async (t) => {
	if (await header.getAdminButton().exists) {
		throw new Error("The admin button should not exist");
	}
});

test("going to the admin panel", async (t) => {
	await AdminUtilities.silentLogin(t);
	await t.click(header.getAdminButton())
		.expect(BrowserUtilities.getURL()).eql(`${config.baseUrl}/dashboard`)
		.expect(adminPage.page.visible).eql(true);
});

test("that the logout button shows up when the user is logged in", async (t) => {
	await AdminUtilities.silentLogin(t);
	await t.expect(header.getLogoutButton().exists);
});