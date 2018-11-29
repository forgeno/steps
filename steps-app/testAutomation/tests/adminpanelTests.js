import {RequestLogger, RequestMock} from "testcafe";

import config from "../config";
import AdminUtilities from "../util/AdminUtilities";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

const loginPage = new LoginPage();
const adminPage = new AdminDashboardPage();

const logger = RequestLogger({
    logResponseHeaders: true,
    logResponseBody: true,
	logRequestBody: true,
	stringifyRequestBody: true
});

const TEST_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Images_2015_logo.svg/375px-Google_Images_2015_logo.svg.png";

const response = {
    images: [
        {id: 1,url: TEST_IMAGE, sidewalk: {id: 2}}, 
        {id: 2, url: TEST_IMAGE}, 
        {id: 3, url: TEST_IMAGE}, 
        {id: 4, url: TEST_IMAGE}, 
        {id: 5, url: TEST_IMAGE}, 
        {id: 6, url: TEST_IMAGE}, 
        {id: 7, url: TEST_IMAGE}]
}

const mock = RequestMock().onRequestTo(/adminAccount\/login\//).respond(),
    mockgetUnapprovedImages = RequestMock().onRequestTo(/sidewalk\/unapprovedImages\//).respond(response),
    mockHandleApproveOrRejectImages = RequestMock().onRequestTo(/sidewalk\/2\/image\/respond\//).respond(),
    mockUnapproveAndHandleApproveOrReject =  RequestMock()
                                                .onRequestTo(/sidewalk\/2\/image\/respond\//)
                                                .respond()
                                                .onRequestTo(/sidewalk\/unapprovedImages\//)
                                                .respond(response);

fixture `Tests admin panel carousels`
    .page `${config.baseUrl}/dashboard`
	.beforeEach(async (t) => {
        await t.typeText(loginPage.username, "lorem iiii")
        .typeText(loginPage.password, "aVery strong pa$$w0rd")
        .click(loginPage.submit);
        await AdminUtilities.silentLogin(t);
        await AdminUtilities.generateAdminDummyImages(t);

	});


// test.requestHooks(logger, mockgetUnapprovedImages)("login as admin and check if admin tools are visible", async (t) => {
//     await t.expect(adminPage.carousel.visible).eql(true);
//     await t.expect(adminPage.acceptButton.visible).eql(true);
//     await t.expect(adminPage.rejectButton.visible).eql(true);
// });

// test.requestHooks(logger, mockHandleApproveOrRejectImages)("should be able to reject an image", async (t) => {
//     await AdminUtilities.generateAdminDummyImages(t);
//     await t.expect(adminPage.carousel.visible).eql(true);

//     await t.click(adminPage.rejectButton).wait(2000);
//     await t.expect(adminPage.recordedResponse.textContent).contains("Your response has been recorded")
// });

// test.requestHooks(logger, mockHandleApproveOrRejectImages)("should be able to successfully accept an image", async (t) => {
//     await AdminUtilities.generateAdminDummyImages(t);
//     await t.expect(adminPage.carousel.visible).eql(true);

//     await t.click(adminPage.acceptButton).wait(2000);
//     await t.expect(adminPage.recordedResponse.textContent).contains("Your response has been recorded")
// });

// test.requestHooks(logger, mockHandleApproveOrRejectImages)("should show error message when handling image due to api returning incorrect response", async (t) => {
//     await AdminUtilities.generateAdminDummyErrorImages(t);
//     await t.expect(adminPage.carousel.visible).eql(true);;

//     await t.click(adminPage.acceptButton).wait(2000);
//     await t.expect(adminPage.failedResponse.textContent).contains("An error occurred while recording your response.")
// });

test.requestHooks(logger, mockUnapproveAndHandleApproveOrReject)("test caorusel", async (t) => {
    await t.expect(adminPage.carousel.visible).eql(true);
    await t.click(adminPage.acceptButton).wait(2000);
    await t.expect(adminPage.carouselImage.visible).eql(true);
    // await t.expect(adminPage.recordedResponse.textContent).contains("Your response has been recorded");
});