import { RequestLogger, RequestMock } from 'testcafe';

import config from "../config";
import MapPage from "../pages/MapPage";
import SidewalkDrawer from "../pages/SidewalkDrawer";
import AdminUtilities from "../util/AdminUtilities";
import BaseModal from "../pages/BaseModal";
import ImageUploadModal from "../pages/ImageUploadModal";
import Notifications from "../pages/Notifications";
import ImageGallery from "../pages/ImageGallery";
import SidewalkUtilities from "../util/SidewalkUtilities";
import RatingsModal from "../pages/RatingsModal";
import {getRatingDescription} from "../../src/util/RatingUtil";

// constants
const COMMENT_TEXT = `Automation test comment ${new Date().toISOString()}`;

// pages
const mapPage = new MapPage();
const drawer = new SidewalkDrawer();
const baseModal = new BaseModal();
const imageUploadModal = new ImageUploadModal();
const notifications = new Notifications();
const imageGallery = new ImageGallery();
const ratingsModal = new RatingsModal();

// variables
const logger = RequestLogger({
    logResponseHeaders: true,
    logResponseBody: true,
	logRequestBody: true,
	stringifyRequestBody: true
});

const mock = RequestMock().onRequestTo(/image\/delete\//).respond();

fixture `Tests the sidewalk drawer`
    .page `${config.baseUrl}`
	.beforeEach(async (t) => {
		await mapPage.waitForLoad(t);
		await mapPage.loadDefaultSidewalk(t);
		await AdminUtilities.silentLogin(t);
		await t.expect(drawer.drawer.visible).eql(true);
	});

test("viewing comments uploaded to a sidewalk", async (t) => {
	await t.click(drawer.commentsHeader);
	await t.eval(() => {
		const sidewalk = DEV_SIDEWALK_STORE.state.currentSidewalk;
		sidewalk.comments = [{
			text: "first comment",
			date: "2012-12-13T15:00:00Z",
			id: "fakeCommentId1"
		}, {
			text: "second comment",
			date: "2012-11-13T15:00:00Z",
			id: "fakeCommentId2"
		}];
		DEV_SIDEWALK_STORE.setState({currentSidewalk: sidewalk});
	});
	
    await t.expect(drawer.getCommentWithText("first comment").visible).eql(true)
		.expect(drawer.getCommentWithText("second comment").visible).eql(true)
		.expect(drawer.getCommentsCount()).eql(2)
		.expect(drawer.getCommentDateByText("first comment").textContent).contains("December 13, 2012 - ")
		.expect(drawer.getCommentDateByText("second comment").textContent).contains("November 13, 2012 - ");
});

test("attempting to post a long comment on a sidewalk", async (t) => {
	await t.click(drawer.commentsHeader)
		.typeText(drawer.commentInput, "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz")
		.expect(drawer.submitComment.hasAttribute("disabled")).eql(true)
});

test("posting a comment on a sidewalk", async (t) => {
    await t.click(drawer.commentsHeader)
		.expect(drawer.submitComment.hasAttribute("disabled")).eql(true)
		.typeText(drawer.commentInput, COMMENT_TEXT)
		.click(drawer.submitComment)
		.expect(drawer.getCommentWithText(COMMENT_TEXT).textContent).eql(COMMENT_TEXT);
});

test("attempting to delete a comment but cancelling", async (t) => {
    await t.click(drawer.commentsHeader)
		.click(drawer.getDeleteCommentButton(COMMENT_TEXT))
		.click(baseModal.cancel)
		.expect(baseModal.cancel.exists).eql(false)
		.wait(1000)
		.expect(drawer.getCommentWithText(COMMENT_TEXT).textContent).eql(COMMENT_TEXT);
	await t.expect(logger.contains(record => record.request.url.includes("/comment/delete/"))).notOk();
});

test.requestHooks(logger)("deleting a comment on a sidewalk", async (t) => {
    await t.click(drawer.commentsHeader)
		.click(drawer.getDeleteCommentButton(COMMENT_TEXT))
		.click(baseModal.confirm)
		.expect(baseModal.cancel.exists).eql(false)
		.expect(drawer.getCommentWithText(COMMENT_TEXT).count).eql(0);
		
	await t.expect(logger.contains(record => record.request.url.includes("/comment/delete/") && record.response.statusCode === 200)).ok();
});

test.requestHooks(logger)("uploading an image to a sidewalk", async (t) => {
	const selectFile = async () => {
		await t.setFilesToUpload(imageUploadModal.selectImageInput, "../data/smallTestImage.png");
	};
	
	// verify the modal is visible and confirm can not be clicked
	await t.click(drawer.imagesHeader)
		.click(drawer.uploadImagesButton)
		.expect(imageUploadModal.modal.visible).eql(true)
		.expect(imageUploadModal.confirm.hasAttribute("disabled")).eql(true);
		
	await selectFile();
	
	// cancel the upload and make sure no request was sent
	await t.click(imageUploadModal.cancel)
		.expect(logger.contains(record => record.request.url.includes("/image/create/"))).notOk()
		.expect(imageUploadModal.modal.exists).eql(false);
	
	// confirm upload but the upload fails
	await t.click(drawer.uploadImagesButton);
	await selectFile();
	await t.eval(() => {
		DEV_SIDEWALK_STORE.setState({
			uploadingSidewalkImage: false,
			uploadedImageError: true
		});
	});
	await t.expect(notifications.text.visible).eql(true)
		.expect(notifications.text.textContent).contains("error")
		.expect(imageUploadModal.modal.visible).eql(true);
	
	// confirm upload and verify success
	await t.click(imageUploadModal.confirm)
		.expect(logger.contains(record => record.request.url.includes("/image/create/") && record.response.statusCode === 200)).ok({timeout: 10000})
		.expect(notifications.text.visible).eql(true)
		.expect(notifications.text.textContent).contains("uploaded")
		.expect(imageUploadModal.modal.exists).eql(false);
});

test("viewing images on a sidewalk", async (t) => {
	await t.click(drawer.imagesHeader);
	await SidewalkUtilities.generateDummyImages(t);
	
	// check to see all rows loaded
	await t.click(drawer.previewImagesButton)
		.wait(6000)
		.expect(imageGallery.getRowCount()).eql(15);
	
	// check the default selected image
	await t.expect(await imageGallery.getSelectedRowIndex(t)).eql(0);
	
	// test selecting a different image
	await t.click(imageGallery.rows.nth(4).find(".clickableItem"))
		.wait(3500);
	await t.expect(await imageGallery.getSelectedRowIndex(t))
		.eql(4);
	
	// close the gallery and make sure the sidewalk drawer returns
	await t.click(imageGallery.closeButton)
		.expect(drawer.imagesHeader.visible).eql(true);
});

test.requestHooks(logger)("attempting to delete an image but cancelling", async (t) => {
    await t.click(drawer.imagesHeader);
	await SidewalkUtilities.generateDummyImages(t);
	await t.click(drawer.previewImagesButton);
	
	await t.click(imageGallery.imageDeleteButton)
		.click(baseModal.cancel)
		.expect(baseModal.cancel.exists).eql(false)
		.wait(1000);
	
	await t.expect(logger.contains(record => record.request.url.includes("/image/delete/"))).notOk();
});

test.requestHooks(logger, mock)("deleting an image on a sidewalk", async (t) => {
	await t.click(drawer.imagesHeader);
	await SidewalkUtilities.generateDummyImages(t);
	await t.click(drawer.previewImagesButton);
	
	const loadedImages = await SidewalkUtilities.getLoadedImagesCount(t);
	await t.click(imageGallery.imageDeleteButton)
		.click(baseModal.confirm);
	
	await t.expect(logger.contains(record => record.request.url.includes("/image/delete/") && record.response.statusCode === 200)).ok()
		.expect(baseModal.cancel.exists).eql(false);
	
	await t.expect(await SidewalkUtilities.getLoadedImagesCount(t)).eql(loadedImages - 1);
});

test("to make sure image view components do not exist if a sidewalk has no images", async (t) => {
	
	await SidewalkUtilities.forceNoImages(t);
	await t.expect(drawer.lastUploadedImage.exists).eql(false)
		.click(drawer.imagesHeader)
		.expect(drawer.previewImagesButton.exists).eql(false)
});

test("posting a comment on a sidewalk that contains personal information", async (t) => {
    await t.click(drawer.commentsHeader)
		.typeText(drawer.commentInput, "Lorem ipsum kung fu henry is a legend call him at 999 980-7819")
		.expect(drawer.submitComment.hasAttribute("disabled")).eql(true)
		.selectText(drawer.commentInput)
		.pressKey("delete")
		.typeText(drawer.commentInput, "Lorem ipsum kung fu henry is a legend message him at kungfu@henry.com")
		.expect(drawer.submitComment.hasAttribute("disabled")).eql(true);
});

test.requestHooks(logger)("starting to submit a rating but cancelling", async (t) => {
	await t.click(drawer.ratingsHeader)
		.click(drawer.submitRatingButton)
		.expect(ratingsModal.cancel.visible).eql(true)
		.click(ratingsModal.cancel)
		.expect(ratingsModal.cancel.exists).eql(false);
	// make sure no request was made to rate the sidewalk
	await t.expect(logger.contains(record => record.request.url.includes("/rate/"))).notOk();
});

test.requestHooks(logger)("submitting a rating to the sidewalk", async (t) => {
	await t.click(drawer.ratingsHeader)
		.click(drawer.submitRatingButton)
		.expect(ratingsModal.cancel.visible).eql(true)
		.drag(ratingsModal.accessibilitySlider, 100, 0)
		.drag(ratingsModal.connectivitySlider, -100, 0)
		.drag(ratingsModal.physicalSafetySlider, 60, 0)
		.drag(ratingsModal.senseOfSecuritySlider, -60, 0)
		.wait(500);
	
	await t.expect(ratingsModal.accessibilityText.textContent).eql(getRatingDescription(5))
		.expect(ratingsModal.connectivityText.textContent).eql(getRatingDescription(1))
		.expect(ratingsModal.comfortText.textContent).eql(getRatingDescription(3))
		.expect(ratingsModal.physicalSafetyText.textContent).eql(getRatingDescription(4))
		.expect(ratingsModal.senseOfSecurityText.textContent).eql(getRatingDescription(2));
	
	await t.click(ratingsModal.confirm)
		.expect(logger.contains(
			record => (
				record.request.url.includes("/rate/") &&
				record.response.statusCode === 200)
			)
		).ok()
		.expect(logger.contains(record => record.request.url.includes("/ratings/") && record.response.statusCode === 200)).ok();
});