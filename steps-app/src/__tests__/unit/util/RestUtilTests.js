import sinon from "sinon";
import rp from "request-promise";
import {expect} from "chai";

import {DATABASE_BASE_URL} from "../../../constants/DatabaseConstants";
import RestUtil from "../../../util/RestUtil";

describe("Tests the RestUtil class", function() {
	
	let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Tests the sendPostRequest method with no option overrides", () => {
		const bodyObj = {
			test: 1,
			test2: "abc",
			xyz: {
				nestedProp: "key"
			}
		};
		sandbox.stub(rp, "post");
		RestUtil.sendPostRequest("nowhere", bodyObj);
		expect(rp.post.callCount).to.be.equal(1);
		expect(rp.post.getCall(0).args[0]).to.deep.equal({
			uri: `${DATABASE_BASE_URL}/api/nowhere`,
			headers: {
				"Content-Type": "application/json"
			},
			json: true,
			method: "POST",
			body: bodyObj
		});
	});
	
	it("Tests the sendPostRequest method with option overrides", () => {
		const bodyObj = {
			test: 1,
			test2: "abc",
			xyz: {
				nestedProp: "key"
			}
		};
		sandbox.stub(rp, "post");
		RestUtil.sendPostRequest("nowhere", bodyObj, {uri: "none", method: "None"});
		expect(rp.post.callCount).to.be.equal(1);
		expect(rp.post.getCall(0).args[0]).to.deep.equal({
			uri: "none",
			headers: {
				"Content-Type": "application/json"
			},
			json: true,
			method: "None",
			body: bodyObj
		});
	});
	
	it("Tests the sendPostRequest method to make sure it returns a promise with the results if they are valid", (done) => {
		const response = {
			test: "value",
			key2: "anotherVal"
		};
		sandbox.stub(rp, "post").returns(Promise.resolve(response));
		RestUtil.sendPostRequest("nowhere", {}).then((res) => {
			expect(res).to.deep.equal(response);
			done();
		});
	});
	
	it("Tests the sendGetRequest method with no option overrides", () => {
		const bodyObj = {
			test: 1,
			test2: "abc",
			xyz: {
				nestedProp: "key"
			}
		};
		sandbox.stub(rp, "get");
		RestUtil.sendGetRequest("nowhere", bodyObj);
		expect(rp.get.callCount).to.be.equal(1);
		expect(rp.get.getCall(0).args[0]).to.deep.equal({
			uri: `${DATABASE_BASE_URL}/api/nowhere`,
			json: true,
			qs: bodyObj
		});
	});
	
	it("Tests the sendGetRequest method with option overrides", () => {
		const bodyObj = {
			test: 1,
			test2: "abc",
			xyz: {
				nestedProp: "key"
			}
		};
		sandbox.stub(rp, "get");
		RestUtil.sendGetRequest("nowhere", bodyObj, {uri: "none", json2: false});
		expect(rp.get.callCount).to.be.equal(1);
		expect(rp.get.getCall(0).args[0]).to.deep.equal({
			uri: "none",
			json: true,
			qs: bodyObj,
			json2: false
		});
	});
	
	it("Tests the sendGetRequest method to make sure it returns a promise with the results if they are valid", (done) => {
		const response = {
			test: "value",
			key2: "anotherVal"
		};
		sandbox.stub(rp, "get").returns(Promise.resolve(response));
		RestUtil.sendGetRequest("nowhere", {}).then((res) => {
			expect(res).to.deep.equal(response);
			done();
		});
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});
