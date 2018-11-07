import sinon from "sinon";
import {expect} from "chai";
import { promises } from "fs";

import AdminStore from "../../../admin/AdminStore";
import RestUtil from "../../../util/RestUtil";

const SIDEWALK_ID = "testSidewalkId";

describe("Tests the AdminStore", function() {
	
	const store = new AdminStore();
	let sandbox = null;
	
	beforeEach(() => {
		store.setState({
			currentSidewalk: {
				id: SIDEWALK_ID,
				comments: []
			}
		});
		sandbox = sinon.createSandbox();
	});
	
	it("tests the onDeleteComment method with a successful request", () => {
		const spy = sandbox.spy();
		sandbox.stub(console, "error");
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: (callback) => {
				callback();
				return {
					catch: () => {
					}
				}
			}
		});
		store.setState({
			username: "a",
			password: "b"
		});
		store.onDeleteComment(SIDEWALK_ID, 1, spy);

		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${SIDEWALK_ID}/comment/delete`);
		expect(RestUtil.sendPostRequest.getCall(0).args[1]).to.deep.equal({
			id: 1,
			username: "a",
			password: "b"
		});

		expect(store.state.successfullyDeletedComment).to.be.true;
		expect(store.state.isDeletingComment).to.be.false;
		expect(store.state.failedDeleteComment).to.be.false;
		expect(console.error.notCalled).to.be.true;
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args[0]).to.be.true;
	});
	
	it("tests the onDeleteComment method with an unsuccessful request", () => {
		const spy = sandbox.spy();
		sandbox.stub(console, "error");
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: (callback) => {
				return {
					catch: (errCallback) => {
						errCallback("err msg");
					}
				}
			}
		});
		store.setState({
			username: "a",
			password: "b"
		});
		store.onDeleteComment(SIDEWALK_ID, 1, spy);

		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${SIDEWALK_ID}/comment/delete`);
		expect(RestUtil.sendPostRequest.getCall(0).args[1]).to.deep.equal({
			id: 1,
			username: "a",
			password: "b"
		});
		expect(store.state.isDeletingComment).to.be.false;
		expect(store.state.failedDeleteComment).to.be.true;
		expect(store.state.successfullyDeletedComment).to.be.false;
		expect(console.error.calledOnce).to.be.true;
		expect(console.error.getCall(0).args[0]).to.be.equal("err msg");
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args[0]).to.be.false;
	});
	
	it("tests the onDeleteComment method while the request is pending", () => {
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: () => {
				return {
					catch: () => {}
				}
			}
		});
		store.onDeleteComment();
		expect(store.state.isDeletingComment).to.be.true;
		expect(store.state.failedDeleteComment).to.be.false;
		expect(store.state.successfullyDeletedComment).to.be.false;
	});
	
	it("tests the onDeleteImage method with a successful request", () => {
		const spy = sandbox.spy();
		sandbox.stub(console, "error");
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: (callback) => {
				callback();
				return {
					catch: () => {
					}
				}
			}
		});
		store.setState({
			username: "a",
			password: "b"
		});
		store.onDeleteImage(SIDEWALK_ID, 1, spy);

		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${SIDEWALK_ID}/image/delete`);
		expect(RestUtil.sendPostRequest.getCall(0).args[1]).to.deep.equal({
			imageId: 1,
			username: "a",
			password: "b"
		});

		expect(store.state.successfullyDeletedImage).to.be.true;
		expect(store.state.isDeletingImage).to.be.false;
		expect(store.state.failedDeleteImage).to.be.false;
		expect(console.error.notCalled).to.be.true;
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args[0]).to.be.true;
	});
	
	it("tests the onDeleteImage method with an unsuccessful request", () => {
		const spy = sandbox.spy();
		sandbox.stub(console, "error");
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: (callback) => {
				return {
					catch: (errCallback) => {
						errCallback("err msg");
					}
				}
			}
		});
		store.setState({
			username: "a",
			password: "b"
		});
		store.onDeleteImage(SIDEWALK_ID, 1, spy);

		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${SIDEWALK_ID}/image/delete`);
		expect(RestUtil.sendPostRequest.getCall(0).args[1]).to.deep.equal({
			imageId: 1,
			username: "a",
			password: "b"
		});
		expect(store.state.isDeletingImage).to.be.false;
		expect(store.state.failedDeleteImage).to.be.true;
		expect(store.state.successfullyDeletedImage).to.be.false;
		expect(console.error.calledOnce).to.be.true;
		expect(console.error.getCall(0).args[0]).to.be.equal("err msg");
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args[0]).to.be.false;
	});
	
	it("tests the onDeleteImage method while the request is pending", () => {
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: () => {
				return {
					catch: () => {}
				}
			}
		});
		store.onDeleteImage();
		expect(store.state.isDeletingImage).to.be.true;
		expect(store.state.failedDeleteImage).to.be.false;
		expect(store.state.successfullyDeletedImage).to.be.false;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});