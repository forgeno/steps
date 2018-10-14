import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import UploadSidewalkImageComponent from "../../../sidewalk/UploadSidewalkImageComponent";

describe("<UploadSidewalkImageComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Makes sure the onClick prop is notified when the button is clicked", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<UploadSidewalkImageComponent onClick={spy} />);
		wrapper.find("Button").simulate("click");
		expect(spy.calledOnce).to.be.true;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});