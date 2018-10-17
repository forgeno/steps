import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import PreviewSidewalkImagesComponent from "../../../sidewalk/PreviewSidewalkImagesComponent";

describe("<PreviewSidewalkImagesComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Makes sure onClick is called if the component is clicked", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<PreviewSidewalkImagesComponent onClick={spy} />);
		wrapper.find("div").at(0).simulate("click");
		expect(spy.calledOnce).to.be.true;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});