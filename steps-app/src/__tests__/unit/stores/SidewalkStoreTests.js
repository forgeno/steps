import sinon from "sinon";
import {expect} from "chai";
import { promises } from "fs";

import SidewalkStore from "../../../sidewalk/SidewalkStore";
import RestUtil from "../../../util/RestUtil";
import PromiseUtilities from "../../../../testUtil/PromiseUtilities";

const SIDEWALK_ID = "testSidewalkId";

describe("Tests the SidewalkStore", function() {
	
	const store = new SidewalkStore();
	let sandbox = null;
	
	beforeEach(() => {
		store.setState({
			currentSidewalk: {
				id: SIDEWALK_ID
			}
		});
		sandbox = sinon.createSandbox();
	});
	
	it("Tests the onUploadSidewalkImage method", () => {
		sandbox.stub(console, "error");
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: (callback) => {
				callback();
				return {
					catch: (errCallback) => {
						errCallback("err msg");
						expect(console.error.calledOnce).to.be.true;
						expect(console.error.getCall(0).args[0]).to.be.equal("err msg");
					}
				}
			}
		});
		const base64 = "aWElaopkopeawawKEOAea";
		
		store.onUploadSidewalkImage(base64);
		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${SIDEWALK_ID}/image/create`);
		expect(RestUtil.sendPostRequest.getCall(0).args[1]).to.deep.equal({
			image: base64
		});
	});
	
	it("Tests the onLoadUploadedImages method", () => {
		const responseImages = [{
			id: "img1",
			url: "url1"
		}, {
			id: "img2",
			url: "url2"
		}];
		const existingImages = [{id: "exist1", url: "urlExist1"}];
		store.setState({
			loadedUserImages: existingImages
		});
		
		const spy = sandbox.spy();
		sandbox.stub(console, "error");
		sandbox.spy(store, "setState");
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: (callback) => {
				callback({
					hasMoreImages: false,
					images: responseImages
				});
				expect(store.setState.calledOnce).to.be.true;
				expect(store.setState.args[0][0]).to.deep.equal({
					loadedUserImages: existingImages.slice(0).concat(responseImages),
					hasNextImagesPage: false
				});
				return {
					catch: (errCallback) => {
						errCallback("err msg");
						expect(console.error.calledOnce).to.be.true;
						expect(console.error.getCall(0).args[0]).to.be.equal("err msg");
					}
				}
			}
		});
		store.onLoadUploadedImages(0, 10, spy);
		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${SIDEWALK_ID}/image`);
		expect(RestUtil.sendPostRequest.getCall(0).args[1]).to.deep.equal({
			startIndex: 0,
			endIndex: 10
		});
		expect(spy.calledOnce).to.be.true;
	});

	it("should get the appropriate data and set sidewalkDetails property of state", () => {
		const sidewalkDetails = {
			averageVelocity: 0,
			totalImages: 0,
			id: "2",
			totalRatings: 13,
			comments: [{id: 1, text: "test", date: "2018-10-13"}]
		}, summaryDetails = {
			ratingOne: 1.5,
			id: "2"
		};
		
		const sendGetRequestStub = sandbox.stub(RestUtil, "sendGetRequest").resolves(sidewalkDetails),
			setStateSpy = sandbox.spy(store, "setState");

		store.onLoadSidewalkDetails(summaryDetails);
		return Promise.resolve(true).then(() => {
			expect(setStateSpy.called).to.be.true;
			expect(sendGetRequestStub.called).to.be.true;
			expect(store.state.currentSidewalk).to.deep.equal(Object.assign(sidewalkDetails, summaryDetails));
		});
	})

	it("should test the onUploadComment function", () => {
		const setStateSpy = sandbox.spy(store, "setState");
		
		sandbox.stub(console, "error");
		sandbox.stub(RestUtil, "sendPostRequest").returns({
			then: (callback) => {
				callback({
					value: ""
				});
				expect(setStateSpy.calledOnce).to.be.true;
				return {
					catch: (errCallback) => {
						errCallback("error msg");
						expect(console.error.calledOnce).to.be.true;
						expect(console.error.getCall(0).args[0]).to.be.equal("error msg");
					}
				}
			}	
		});

		const comment = "test comment";
		store.onUploadComment(comment);
		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${store.state.currentSidewalk}/comment/create`);
		expect(store.state.value).to.equal("");

	});
	
	afterEach(() => {
		sandbox.restore();
	});
});