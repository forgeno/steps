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
        {id: 1,url: TEST_IMAGE}, 
        {id: 2, url: TEST_IMAGE}, 
        {id: 3, url: TEST_IMAGE}, 
        {id: 4, url: TEST_IMAGE}, 
        {id: 5, url: TEST_IMAGE}, 
        {id: 6, url: TEST_IMAGE}, 
        {id: 7, url: TEST_IMAGE}]
}

const mock = RequestMock().onRequestTo(/adminAccount\/login\//).respond(),
    mockgetUnapprovedImages = RequestMock().onRequestTo(/sidewalk\/unapprovedImages\//).respond(response),
    mockHandleApproveOrRejectImages = RequestMock().onRequestTo(/sidewalk\/2\/image\/response\//);


fixture `Tests admin panel carousels`
    .page `${config.baseUrl}/dashboard`
	.beforeEach(async (t) => {
        await t.typeText(loginPage.username, "lorem iiii")
        .typeText(loginPage.password, "aVery strong pa$$w0rd")
        .click(loginPage.submit);
        await AdminUtilities.silentLogin(t);
        await AdminUtilities.generateAdminDummyImages(t);
	});


test.requestHooks(logger)("make sure the carousel interacts properly", async (t) => {
    await t.expect(adminPage.previewContainer.visible).eql(true);

    await t.expect(adminPage.itemActive.visible).eql(true);
    await t.expect(adminPage.leftCarouselArrowDisabled.visible).eql(true);
    
    await t.click(adminPage.rightCarouselArrow).wait(2000);
    await t.expect(adminPage.leftCarouselArrow.visible).eql(true);

    await t.click(adminPage.leftCarouselArrow).wait(2000);
    await t.expect(adminPage.leftCarouselArrow.visible).eql(false);
});

test.requestHooks(logger,mockgetUnapprovedImages)("make sure the image previewer works properly", async (t) => {
    await t.expect(adminPage.previewContainer.visible).eql(true);
    await t.expect(adminPage.previewRightArrow.visible).eql(true);

    await t.click(adminPage.previewRightArrow).wait(2000);
    await t.expect(adminPage.previewLeftArrow.visible).eql(true);
});

test.requestHooks(logger, mockgetUnapprovedImages)("test rejecting an image", async (t) => {
    await t.expect(adminPage.previewContainer.visible).eql(true);
    await t.expect(adminPage.previewRightArrow.visible).eql(true);
    await t.click(adminPage.rejectButton).wait(2000);

});