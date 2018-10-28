import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import SidewalkImageDetailsComponent from "../../../sidewalk/images/SidewalkImageDetailsComponent";
import SidewalkActions from "../../../sidewalk/SidewalkActions";

describe("<SidewalkImageDetailsComponent />", function() {
	
	let wrapper = null;
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
		wrapper = shallow(<SidewalkImageDetailsComponent />);
		wrapper.instance().store.singleton.setState({
			currentSidewalk: {
				totalImages: 10,
				lastImage: {
					url: "a"
				}
			}
		});
	});
	
	it("Makes sure _openImageModal sets the modal visible state to true", () => {
		wrapper.instance()._openImageModal();
		expect(wrapper.state("modalOpened")).to.be.true;
	});
	
	it("Makes sure _closeImageModal sets the modal visible state to false", () => {
		
		wrapper.instance()._closeImageModal();
		expect(wrapper.state("modalOpened")).to.be.false;
	});
	
	it("Makes sure _closeImageModal invokes an action when it is called with an argument", () => {
		
		const spy = sandbox.spy(SidewalkActions, "uploadSidewalkImage");
		wrapper.instance()._closeImageModal("a");
		
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args[0]).to.be.equal("a");
	});
	
	it("Makes sure _closeImageModal does not invoke an action when it is not called with an argument", () => {
		
		const spy = sandbox.spy(SidewalkActions, "uploadSidewalkImage");
		wrapper.instance()._closeImageModal();
		
		expect(spy.notCalled).to.be.true;
	});
	
	it("Makes sure _viewImages displays the uploaded images for this sidewalk", () => {
		const spy = sandbox.spy();
		wrapper.setProps({
			onOpenImages: spy
		});
		wrapper.instance()._viewImages();
		expect(spy.calledOnce).to.be.true;
	});
	
	it("Makes sure a loading spinner displays while an image is being uploaded", () => {
		
		wrapper.setState({
			uploadingSidewalkImage: true
		});
		expect(wrapper.find("LoaderComponent")).to.have.lengthOf(1);
	});
	
	it("Makes sure a loading spinner does not display if no image is being uploaded", () => {
		
		wrapper.setState({
			uploadingSidewalkImage: false
		});
		expect(wrapper.find("LoaderComponent")).to.have.lengthOf(0);
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});
