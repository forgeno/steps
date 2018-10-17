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
	
	it("Makes sure _viewImages displays the uploaded images for this sidewalk", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		wrapper.instance()._viewImages();
		expect(wrapper.state("viewingImages")).to.be.true;
		expect(wrapper.find("SidewalkImagesView").prop("visible")).to.be.true;
	});
	
	it("Makes sure _closeImages displays the uploaded images for this sidewalk", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		wrapper.instance()._viewImages();
		wrapper.instance()._closeImages();
		expect(wrapper.state("viewingImages")).to.be.false;
		expect(wrapper.find("SidewalkImagesView").prop("visible")).to.be.false;
	});
	
	it("Makes sure a loading spinner displays while an image is being uploaded", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		wrapper.setState({
			uploadingSidewalkImage: true
		});
		expect(wrapper.find("LoaderComponent")).to.have.lengthOf(1);
	});
	
	it("Makes sure a loading spinner does not display if no image is being uploaded", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		wrapper.setState({
			uploadingSidewalkImage: false
		});
		expect(wrapper.find("LoaderComponent")).to.have.lengthOf(0);
	});
	
	it("Makes sure an alert displays if an error happened uploading an image", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		wrapper.setState({
			uploadedImageError: true
		});
		expect(wrapper.find("Alert")).to.have.lengthOf(1);
	});
	
	it("Makes sure an alert does not if an error did not happen uploading an image", () => {
		const wrapper = shallow(<SidewalkDetailsView />);
		wrapper.setState({
			uploadedImageError: false
		});
		expect(wrapper.find("Alert")).to.have.lengthOf(0);
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});
