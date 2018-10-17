import sinon from "sinon";
import {expect} from "chai";

import SidewalkStore from "../../../sidewalk/SidewalkStore";
import RestUtil from "../../../util/RestUtil";

const SIDEWALK_ID = "testSidewalkId";

describe("Tests the SidewalkStore", function() {
	
	const store = new SidewalkStore();
	let sandbox = null;
	
	beforeAll(() => {
		store.onLoadSidewalkDetails(SIDEWALK_ID);
	});
	
	beforeEach(() => {
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
	
	afterEach(() => {
		sandbox.restore();
	});
});