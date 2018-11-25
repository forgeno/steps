import sinon from "sinon";
import {expect} from "chai";

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
				id: SIDEWALK_ID,
				comments: []
			}
		});
		sandbox = sinon.createSandbox();
	});
	
	it("Tests the onUploadSidewalkImage method with an invalid image", () => {
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
		const base64 = "aWElaopkopeawawKEOAea";
		
		store.onUploadSidewalkImage(base64);
		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${SIDEWALK_ID}/image/create`);
		expect(RestUtil.sendPostRequest.getCall(0).args[1]).to.deep.equal({
			image: base64
		});
		expect(store.state.uploadedImageError).to.be.true;
		expect(console.error.calledOnce).to.be.true;
		expect(console.error.getCall(0).args[0]).to.be.equal("err msg");
	});
	
	it("Tests the onUploadSidewalkImage method with a valid image", () => {
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
		const base64 = "aWElaopkopeawawKEOAea";
		store.onUploadSidewalkImage(base64);
		expect(RestUtil.sendPostRequest.calledOnce).to.be.true;
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${SIDEWALK_ID}/image/create`);
		expect(RestUtil.sendPostRequest.getCall(0).args[1]).to.deep.equal({
			image: base64
		});
		expect(store.state.uploadImageSucceeded).to.be.true;
		expect(console.error.notCalled).to.be.true;
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
				expect(setStateSpy.calledTwice).to.be.true;
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
		expect(RestUtil.sendPostRequest.getCall(0).args[0]).to.be.equal(`sidewalk/${store.state.currentSidewalk.id}/comment/create`);
	});
	
	it("tests the onRemoveLoadedComment method with a non-existent comment", () => {
		store.setState({
			currentSidewalk: {
				comments: []
			}
		})
		const setStateSpy = sandbox.spy(store, "setState");
		store.onRemoveLoadedComment({});
		expect(setStateSpy.notCalled).to.be.true;
	});
	
	it("tests the onRemoveLoadedComment method with a found comment", () => {
		const comment1 = {};
		store.setState({
			currentSidewalk: {
				comments: [comment1],
				totalComments: 1
			}
		});
		store.onRemoveLoadedComment(comment1);
		expect(store.state.currentSidewalk.comments.length).to.be.equal(0);
		expect(store.state.currentSidewalk.totalComments).to.be.equal(0);
	});
	
	it("tests the onRemoveLoadedImage method with a non-existent image", () => {
		store.setState({
			currentSidewalk: {
				totalImages: 5
			},
			loadedUserImages: [{}, {}, {}, {}, {}]
		})
		const setStateSpy = sandbox.spy(store, "setState");
		store.onRemoveLoadedImage({});
		expect(setStateSpy.notCalled).to.be.true;
	});
	
	it("tests the onRemoveLoadedImage method with a found image when it is the first image", () => {
		const first = {},
			spy1 = sandbox.spy(),
			spy2 = sandbox.spy(),
			second = {},
			third = {};
		store.setState({
			currentSidewalk: {
				totalImages: 55,
				lastImage: first
			},
			loadedUserImages: [first, second, third]
		})
		store.onRemoveLoadedImage(first, spy1, spy2);
		expect(store.state.loadedUserImages).to.deep.equal([second, third]);
		expect(store.state.currentSidewalk.totalImages).to.be.equal(54);
		expect(store.state.currentSidewalk.lastImage).to.be.equal(second);
		expect(spy1.notCalled).to.be.true;
		expect(spy2.notCalled).to.be.true;
	});
	
	it("tests the onRemoveLoadedImage method with a found image when it is the second image", () => {
		const first = {},
			spy1 = sandbox.spy(),
			spy2 = sandbox.spy(),
			second = {},
			third = {};
		store.setState({
			currentSidewalk: {
				totalImages: 55,
				lastImage: first
			},
			loadedUserImages: [first, second, third]
		})
		store.onRemoveLoadedImage(second, spy1, spy2);
		expect(store.state.loadedUserImages).to.deep.equal([first, third]);
		expect(store.state.currentSidewalk.totalImages).to.be.equal(54);
		expect(store.state.currentSidewalk.lastImage).to.be.equal(first);
		expect(spy1.notCalled).to.be.true;
		expect(spy2.notCalled).to.be.true;
	});
	
	it("tests the onRemoveLoadedImage method with a found image when it is the third image", () => {
		const first = {},
			spy1 = sandbox.spy(),
			spy2 = sandbox.spy(),
			second = {},
			third = {};
		store.setState({
			currentSidewalk: {
				totalImages: 55,
				lastImage: first
			},
			loadedUserImages: [first, second, third]
		})
		store.onRemoveLoadedImage(third, spy1, spy2);
		expect(store.state.loadedUserImages).to.deep.equal([first, second]);
		expect(store.state.currentSidewalk.totalImages).to.be.equal(54);
		expect(store.state.currentSidewalk.lastImage).to.be.equal(first);
		expect(spy1.calledOnce).to.be.true;
		expect(spy2.notCalled).to.be.true;
	});
	
	it("tests the onRemoveLoadedImage method with a found image when it is the only image", () => {
		const first = {},
			spy1 = sandbox.spy(),
			spy2 = sandbox.spy();
		store.setState({
			currentSidewalk: {
				totalImages: 55,
				lastImage: first
			},
			loadedUserImages: [first]
		})
		store.onRemoveLoadedImage(first, spy1, spy2);
		expect(store.state.loadedUserImages.length).to.be.equal(0);
		expect(store.state.currentSidewalk.totalImages).to.be.equal(54);
		expect(store.state.currentSidewalk.lastImage).to.be.equal(null);
		expect(spy1.notCalled).to.be.true;
		expect(spy2.calledOnce).to.be.true;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});