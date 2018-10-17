import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import SidewalkDetailsView from "../../../sidewalk/SidewalkDetailsView";
import SidewalkActions from "../../../sidewalk/SidewalkActions";

describe("<SidewalkDetailsView />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Makes sure _openImageModal sets the modal visible state to true", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		wrapper.instance()._openImageModal();
		expect(wrapper.state("modalOpened")).to.be.true;
	});
	
	it("Makes sure _closeImageModal sets the modal visible state to false", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		wrapper.instance()._closeImageModal();
		expect(wrapper.state("modalOpened")).to.be.false;
	});
	
	it("Makes sure _closeImageModal invokes an action when it is called with an argument", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		const spy = sandbox.spy(SidewalkActions, "uploadSidewalkImage");
		wrapper.instance()._closeImageModal("a");
		
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args[0]).to.be.equal("a");
	});
	
	it("Makes sure _closeImageModal does not invoke an action when it is not called with an argument", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		const spy = sandbox.spy(SidewalkActions, "uploadSidewalkImage");
		wrapper.instance()._closeImageModal();
		
		expect(spy.notCalled).to.be.true;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});
