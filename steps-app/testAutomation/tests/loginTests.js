import {RequestLogger, RequestMock, Selector} from "testcafe";

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
	await t.typeText(loginPage.username, "lorem ipsum")
		.typeText(loginPage.password, "a random password")
		.click(loginPage.submit)
		.expect(notifications.text.textContent).contains("incorrect");
});

test.requestHooks(logger, mock)("logging in with correct credentials", async (t) => {
	await t.typeText(loginPage.username, "lorem iiii")
		.typeText(loginPage.password, "aVery strong pa$$w0rd")
		.click(loginPage.submit)
		.expect(logger.contains(record => record.request.url.includes("/adminAccount/login/") && record.response.statusCode === 200)).ok();
	
	await t.expect(adminPage.page.visible).eql(true);
});

test("that the login button is disabled with an empty username or password", async (t) => {
	await t.expect(loginPage.submit.hasAttribute("disabled")).eql(true)
		.typeText(loginPage.username, "lorem ipsum")
		.expect(loginPage.submit.hasAttribute("disabled")).eql(true)
		.typeText(loginPage.password, "ioawkoieoiawoiea")
		.expect(loginPage.submit.hasAttribute("disabled")).eql(false);
});

test("that login gets disabled when the user attempts to login incorrectly more than 3 times", async (t) => {
	
	await t.typeText(loginPage.username, "lorem iiii")
			.typeText(loginPage.password, "aVery strong pa$$w0rd")
			.click(loginPage.submit)

	await t.expect(notifications.loginAttemptText.textContent).contains("You have 3 Login Attempts");

	await t.typeText(loginPage.username, "lorem iiii")
	.typeText(loginPage.password, "aVery strong pa$$w0rd")
	.click(loginPage.submit)

	await t.expect(notifications.loginAttemptText.textContent).contains("You have 2 Login Attempts");

	await t.typeText(loginPage.username, "lorem iiii")
	.typeText(loginPage.password, "aVery strong pa$$w0rd")
	.click(loginPage.submit)

	await t.expect(notifications.loginAttemptText.textContent).contains("You have 1 Login Attempts");

	await t.typeText(loginPage.username, "lorem iiii")
	.typeText(loginPage.password, "aVery strong pa$$w0rd")
	.click(loginPage.submit)
	
	await t.expect(notifications.text.textContent).contains("You cannot Login for 1 minute");
});
