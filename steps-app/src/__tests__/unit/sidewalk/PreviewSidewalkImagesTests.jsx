import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import PreviewSidewalkImagesComponent from "../../../sidewalk/images/PreviewSidewalkImagesComponent";

describe("<PreviewSidewalkImagesComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Makes sure no button is rendered if there is no images", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<PreviewSidewalkImagesComponent onClick={spy} imageCount={0} />);
		expect(wrapper.find("Button").length).to.be.equal(0);
	});
	
	it("Makes sure a button is rendered if there is atleast one image", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<PreviewSidewalkImagesComponent onClick={spy} imageCount={1} />);
		expect(wrapper.find("Button").length).to.be.gt(0);
	});
	
	it("Makes sure onClick is called if the button is clicked", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<PreviewSidewalkImagesComponent onClick={spy} imageCount={1} />);
		wrapper.find("Button").simulate("click");
		expect(spy.calledOnce).to.be.true;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});