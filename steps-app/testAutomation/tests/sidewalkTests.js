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
const submitRatingMock = RequestMock().onRequestTo(/\/rate\//).respond({}, 500);

fixture `Tests the sidewalk drawer`
    .page `${config.baseUrl}`
	.beforeEach(async (t) => {
		await mapPage.waitForLoad(t);
		await mapPage.loadDefaultSidewalk(t);
		await AdminUtilities.silentLogin(t);
		await t.expect(drawer.drawer.visible).eql(true);
	});

// test.requestHooks(logger)("uploading an image to a sidewalk", async (t) => {
// 	const selectFile = async () => {
// 		await t.setFilesToUpload(imageUploadModal.selectImageInput, "../data/smallTestImage.png");
// 	};
	
// 	// verify the modal is visible and confirm can not be clicked
// 	await t.click(drawer.imagesHeader)
// 		.click(drawer.uploadImagesButton)
// 		.expect(imageUploadModal.modal.visible).eql(true)
// 		.expect(imageUploadModal.confirm.hasAttribute("disabled")).eql(true);
		
// 	await selectFile();
	
// 	// cancel the upload and make sure no request was sent
// 	await t.click(imageUploadModal.cancel)
// 		.expect(logger.contains(record => record.request.url.includes("/image/create/"))).notOk()
// 		.expect(imageUploadModal.modal.exists).eql(false);
	
// 	// confirm upload but the upload fails
// 	await t.click(drawer.uploadImagesButton);
// 	await selectFile();
// 	await t.eval(() => {
// 		DEV_SIDEWALK_STORE.setState({
// 			uploadingSidewalkImage: false,
// 			uploadedImageError: true
// 		});
// 	});
// 	await t.expect(notifications.text.visible).eql(true)
// 		.expect(notifications.text.textContent).contains("error")
// 		.expect(imageUploadModal.modal.visible).eql(true);
	
// 	// confirm upload and verify success
// 	await t.click(imageUploadModal.confirm)
// 		.expect(logger.contains(record => record.request.url.includes("/image/create/") && record.response.statusCode === 200)).ok({timeout: 10000})
// 		.expect(notifications.text.visible).eql(true)
// 		.expect(notifications.text.textContent).contains("uploaded")
// 		.expect(imageUploadModal.modal.exists).eql(false);
// });

// test("processing a .gif/.jpg/.bmp being attempted to upload to a sidewalk", async (t) => {
// 	await t.click(drawer.imagesHeader)
// 		.click(drawer.uploadImagesButton)
// 		.setFilesToUpload(imageUploadModal.selectImageInput, "../data/smallTestImageB.bmp")
// 		.expect(imageUploadModal.confirm.hasAttribute("disabled")).eql(false)
// 		.setFilesToUpload(imageUploadModal.selectImageInput, "../data/smallTestImageG.gif")
// 		.expect(imageUploadModal.confirm.hasAttribute("disabled")).eql(false)
// 		.setFilesToUpload(imageUploadModal.selectImageInput, "../data/smallTestImageJ.jpg")
// 		.expect(imageUploadModal.confirm.hasAttribute("disabled")).eql(false);
// });

// // fix the image uplo
// test("attempting to upload a large image to a sidewalk", async (t) => {
// 	await t.click(drawer.imagesHeader)
// 		.click(drawer.uploadImagesButton)
// 		.setFilesToUpload(imageUploadModal.selectImageInput, "../data/largeTestImage.jpg")
// 		.expect(imageUploadModal.confirm.hasAttribute("disabled")).eql(true);
// });


// // Need to fix
test.requestHooks(logger, getSidewalkImagesMock)("viewing images on a sidewalk", async (t) => {
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

// test.requestHooks(logger)("attempting to delete an image but cancelling", async (t) => {
//     await t.click(drawer.imagesHeader);
// 	await SidewalkUtilities.generateDummyImages(t);
// 	await t.click(drawer.previewImagesButton);
	
// 	await t.click(imageGallery.imageDeleteButton)
// 		.click(baseModal.cancel)
// 		.expect(baseModal.cancel.exists).eql(false)
// 		.wait(1000);
	
// 	await t.expect(logger.contains(record => record.request.url.includes("/image/delete/"))).notOk();
// });

// test.requestHooks(logger, mock)("deleting an image on a sidewalk", async (t) => {
// 	await t.click(drawer.imagesHeader);
// 	await SidewalkUtilities.generateDummyImages(t);
// 	await t.click(drawer.previewImagesButton);
	
// 	const loadedImages = await SidewalkUtilities.getLoadedImagesCount(t);
// 	await t.click(imageGallery.imageDeleteButton)
// 		.click(baseModal.confirm);
	
// 	await t.expect(logger.contains(record => record.request.url.includes("/image/delete/") && record.response.statusCode === 200)).ok()
// 		.expect(baseModal.cancel.exists).eql(false);
	
// 	await t.expect(await SidewalkUtilities.getLoadedImagesCount(t)).eql(loadedImages - 1);
// });

// test("to make sure image view components do not exist if a sidewalk has no images", async (t) => {
	
// 	await SidewalkUtilities.forceNoImages(t);
// 	await t.expect(drawer.lastUploadedImage.exists).eql(false)
// 		.click(drawer.imagesHeader)
// 		.expect(drawer.previewImagesButton.exists).eql(false)
// });

// test.requestHooks(logger)("starting to submit a rating but cancelling", async (t) => {
// 	await t.click(drawer.ratingsHeader)
// 		.click(drawer.submitRatingButton)
// 		.expect(ratingsModal.cancel.visible).eql(true)
// 		.click(ratingsModal.cancel)
// 		.expect(ratingsModal.cancel.exists).eql(false);
// 	// make sure no request was made to rate the sidewalk
// 	await t.expect(logger.contains(record => record.request.url.includes("/rate/"))).notOk();
// });

// test.requestHooks(logger)("submitting a rating to the sidewalk", async (t) => {
// 	await t.click(drawer.ratingsHeader)
// 		.click(drawer.submitRatingButton)
// 		.expect(ratingsModal.cancel.visible).eql(true)
// 		.drag(ratingsModal.accessibilitySlider, 100, 0)
// 		.drag(ratingsModal.connectivitySlider, -100, 0)
// 		.drag(ratingsModal.physicalSafetySlider, 60, 0)
// 		.drag(ratingsModal.senseOfSecuritySlider, -60, 0)
// 		.wait(500);
	
// 	await t.expect(ratingsModal.accessibilityText.textContent).eql(getRatingDescription(5))
// 		.expect(ratingsModal.connectivityText.textContent).eql(getRatingDescription(1))
// 		.expect(ratingsModal.comfortText.textContent).eql(getRatingDescription(3))
// 		.expect(ratingsModal.physicalSafetyText.textContent).eql(getRatingDescription(4))
// 		.expect(ratingsModal.senseOfSecurityText.textContent).eql(getRatingDescription(2));
	
// 	await t.click(ratingsModal.confirm)
// 		.expect(logger.contains(
// 			record => (
// 				record.request.url.includes("/rate/") &&
// 				record.response.statusCode === 200)
// 			)
// 		).ok()
// 		.expect(logger.contains(record => record.request.url.includes("/ratings/") && record.response.statusCode === 200)).ok();
// });

// test.requestHooks(logger, submitRatingMock)("attempting to submit a rating but failing", async (t) => {
// 	await t.click(drawer.ratingsHeader)
// 		.click(drawer.submitRatingButton)
// 		.expect(ratingsModal.cancel.visible).eql(true)
// 		.drag(ratingsModal.accessibilitySlider, 100, 0)
// 		.drag(ratingsModal.connectivitySlider, -100, 0)
// 		.drag(ratingsModal.physicalSafetySlider, 60, 0)
// 		.drag(ratingsModal.senseOfSecuritySlider, -60, 0)
// 		.wait(500);
	
// 	await t.click(ratingsModal.confirm)
// 		.expect(logger.contains(
// 			record => (
// 				record.request.url.includes("/rate/") &&
// 				record.response.statusCode === 500)
// 			)
// 		).ok();
// 	await t.expect(ratingsModal.cancel.visible).eql(true);
// });

test.requestHooks(logger)("attempt to rate the same sidewalk 2 times within an hour and fail on the fourth on", async (t) => {
	await t.click(drawer.ratingsHeader)
		.click(drawer.submitRatingButton)
		.expect(ratingsModal.cancel.visible).eql(true)
		.drag(ratingsModal.accessibilitySlider, 100, 0)
		.drag(ratingsModal.connectivitySlider, -100, 0)
		.drag(ratingsModal.physicalSafetySlider, 60, 0)
		.drag(ratingsModal.senseOfSecuritySlider, -60, 0)
		.wait(500);
	
	await t.click(ratingsModal.confirm);
	await t.click(drawer.submitRatingButton);
	await t.expect(notifications.text.textContent).contains("You can only rate the same sidewalk once per hour.");
});

test.requestHooks(logger)("attempt to rate a sidewalk 3 times within an hour and fail on the fourth on", async (t) => {
	await t.click(drawer.ratingsHeader)
		.click(drawer.submitRatingButton)
		.wait(500);
	
	await t.click(ratingsModal.confirm);
	await t.click(drawer.drawerCloseButton);
	await t.click(mapPage.map, {offsetX: 410, offsetY: 180})
		.wait(3000);
	
	await t.click(drawer.ratingsHeader)
		.click(drawer.submitRatingButton)
		.expect(ratingsModal.cancel.visible).eql(true)
		.wait(500);


	await t.click(ratingsModal.confirm);
	await t.click(drawer.drawerCloseButton);
	await t.click(mapPage.map, {offsetX: -95 ,offsetY: 160})
	.wait(3000);

	await t.click(drawer.ratingsHeader)
	.click(drawer.submitRatingButton)
	.expect(ratingsModal.cancel.visible).eql(true)
	.wait(500);

	await t.click(ratingsModal.confirm);
	await t.click(drawer.drawerCloseButton);
	await t.click(mapPage.map, {offsetX: 110 ,offsetY: 100})
	.wait(3000);

	await t.click(drawer.ratingsHeader)
	.click(drawer.submitRatingButton)
	.wait(500);

	await t.expect(notifications.text.textContent).contains("You have rated too many sidewalks within 30 seconds.");
});