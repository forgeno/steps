import {RequestLogger, RequestMock} from "testcafe";

import config from "../config";
import BrowserUtilities from "../util/BrowserUtilities";
import LoginPage from "../pages/LoginPage";
import Notifications from "../pages/Notifications";
import AdminDashboardPage from "../pages/AdminDashboardPage";

const loginPage = new LoginPage();
const notifications = new Notifications();
const adminPage = new AdminDashboardPage();

const logger = RequestLogger({
    logResponseHeaders: true,
    logResponseBody: true
});

const mock = RequestMock().onRequestTo(/adminAccount\/login\//).respond();

fixture `Tests logging into the application`
    .page `${config.baseUrl}/login`;

test("logging in with incorrect credentials", async (t) => {
	await t.typeText(loginPage.username, "etkoapwkeopawe")
		.typeText(loginPage.password, "ioawkoieoiawoiea")
		.click(loginPage.submit)
		.expect(notifications.text.textContent).contains("incorrect");
});

test.requestHooks(logger, mock)("logging in with correct credentials", async (t) => {
	await t.typeText(loginPage.username, "etkoapwkeopawe")
		.typeText(loginPage.password, "ioawkoieoiawoiea")
		.click(loginPage.submit)
		.expect(logger.contains(record => record.request.url.includes("/adminAccount/login/") && record.response.statusCode === 200)).ok();
	
	await t.expect(adminPage.page.visible).eql(true);
});