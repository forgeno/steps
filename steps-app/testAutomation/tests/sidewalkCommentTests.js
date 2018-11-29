import { RequestLogger, RequestMock } from 'testcafe';

import config from "../config";
import SidewalkDrawer from "../pages/SidewalkDrawer";
import AdminUtilities from "../util/AdminUtilities";
import BaseModal from "../pages/BaseModal";
import MapPage from "../pages/MapPage";

// constants
const COMMENT_TEXT = `Automation test comment ${new Date().toISOString()}`;

// pages
const mapPage = new MapPage();
const drawer = new SidewalkDrawer();
const baseModal = new BaseModal();

// variables
const logger = RequestLogger({
    logResponseHeaders: true,
    logResponseBody: true,
	logRequestBody: true,
	stringifyRequestBody: true
});

fixture `Tests the sidewalk comments functionality`
    .page `${config.baseUrl}`
	.beforeEach(async (t) => {
		await mapPage.waitForLoad(t);
		await mapPage.loadDefaultSidewalk(t);
		await AdminUtilities.silentLogin(t);
		await t.expect(drawer.drawer.visible).eql(true);
	});

const mock = RequestMock().onRequestTo(/comment\/delete\//).respond({}, 500);
test("posting a comment on a sidewalk", async (t) => {
    await t.click(drawer.commentsHeader)
		.expect(drawer.submitComment.hasAttribute("disabled")).eql(true)
		.typeText(drawer.commentInput, COMMENT_TEXT)
		.click(drawer.submitComment)
		.expect(drawer.getCommentWithText(COMMENT_TEXT).textContent).eql(COMMENT_TEXT);
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

test("attempting to delete a comment but cancelling", async (t) => {
    await t.click(drawer.commentsHeader)
		.click(drawer.getDeleteCommentButton(COMMENT_TEXT))
		.click(baseModal.cancel)
		.expect(baseModal.cancel.exists).eql(false)
		.wait(1000)
		.expect(drawer.getCommentWithText(COMMENT_TEXT).textContent).eql(COMMENT_TEXT);
	await t.expect(logger.contains(record => record.request.url.includes("/comment/delete/"))).notOk();
});

test.requestHooks(logger, mock)("attempting to delete a comment on a sidewalk but encountering an error", async (t) => {
    await t.click(drawer.commentsHeader)
		.click(drawer.getDeleteCommentButton(COMMENT_TEXT))
		.click(baseModal.confirm)
		.expect(baseModal.cancel.visible).eql(true)
		.expect(drawer.getCommentWithText(COMMENT_TEXT).count).eql(1);
		
	await t.expect(logger.contains(record => record.request.url.includes("/comment/delete/") && record.response.statusCode === 500)).ok();
});

test.requestHooks(logger)("deleting a comment on a sidewalk", async (t) => {
    await t.click(drawer.commentsHeader)
		.click(drawer.getDeleteCommentButton(COMMENT_TEXT))
		.click(baseModal.confirm)
		.expect(baseModal.cancel.exists).eql(false)
		.expect(drawer.getCommentWithText(COMMENT_TEXT).count).eql(0);
		
	await t.expect(logger.contains(record => record.request.url.includes("/comment/delete/") && record.response.statusCode === 200)).ok();
});

test("posting a comment on a sidewalk that contains personal information", async (t) => {
    await t.click(drawer.commentsHeader)
		.typeText(drawer.commentInput, "Lorem ipsum kung fu henry is a legend call him at 999 980-7819")
		.expect(drawer.submitComment.hasAttribute("disabled")).eql(true)
		.selectText(drawer.commentInput)
		.pressKey("delete")
		.typeText(drawer.commentInput, "Lorem ipsum kung fu henry is a legend message him at kungfu@henry.com")
		.click(drawer.drawer)
		.expect(drawer.submitComment.hasAttribute("disabled")).eql(true);
});

test.requestHooks(logger)("attempting to post a comment on a sidewalk with weird ASCII characters", async (t) => {
	const weirdText = `▀▀▄▒▒▒▒▒▒▒▒▒▒▄▄▄▀▒▒▒▒▄▀
                ▀▄▄▄▄▄▄▀▀▀▒▒▒▒▒▄▄▀
                   ▒▒▒▒▒▒▒▒▒▒▀▀`;
    await t.click(drawer.commentsHeader)
		.typeText(drawer.commentInput, weirdText)
		.click(drawer.submitComment)
		.expect(drawer.getCommentWithText(weirdText).exists).eql(false);
	
	await t.expect(logger.contains(record => record.request.url.includes("/comment/create/") && record.response.statusCode === 500)).ok();
});

test("attempting to post a comment on a sidewalk that contains swears", async (t) => {
    await t.click(drawer.commentsHeader)
		.typeText(drawer.commentInput, "Hell")
		.click(drawer.drawer)
		.expect(drawer.submitComment.hasAttribute("disabled")).eql(true);
});

test("viewing comments uploaded to a sidewalk when there are no comments", async (t) => {
	await t.click(drawer.commentsHeader);
	await t.eval(() => {
		const sidewalk = DEV_SIDEWALK_STORE.state.currentSidewalk;
		sidewalk.comments = [];
		DEV_SIDEWALK_STORE.setState({currentSidewalk: sidewalk});
	});
	
    await t.expect(drawer.getCommentsCount()).eql(0);
});

test("viewing comments uploaded to a sidewalk when there are lots of comments", async (t) => {
	await t.click(drawer.commentsHeader);
	await t.eval(() => {
		const sidewalk = DEV_SIDEWALK_STORE.state.currentSidewalk;
		sidewalk.comments = [];
		for (let i = 0; i < 500; ++i) {
			sidewalk.comments.push({
				text: String(i),
				date: new Date().toISOString(),
				id: i
			})
		}
		DEV_SIDEWALK_STORE.setState({currentSidewalk: sidewalk});
	});
	
    await t.expect(drawer.getCommentsCount()).eql(25)
		.expect(drawer.prevIcon.exists).eql(false)
		.expect(drawer.nextIcon.visible).eql(true)
		.expect(drawer.getCommentWithText("0").visible).eql(true)
		.expect(drawer.getCommentWithText("25").exists).eql(false)
		.click(drawer.nextIcon)
		.expect(drawer.prevIcon.visible).eql(true)
		.expect(drawer.nextIcon.visible).eql(true)
		.expect(drawer.getCommentWithText("0").exists).eql(false)
		.expect(drawer.getCommentWithText("25").visible).eql(true)
		.click(drawer.prevIcon)
		.expect(drawer.prevIcon.exists).eql(false)
		.expect(drawer.nextIcon.visible).eql(true)
		.expect(drawer.getCommentWithText("0").visible).eql(true)
		.expect(drawer.getCommentWithText("25").exists).eql(false);
});