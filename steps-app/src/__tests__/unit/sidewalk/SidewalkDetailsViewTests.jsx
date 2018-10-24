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

	it("Should open the drawer when a map is clicked and call the appropriate functions", () => {
		const props={mapClicked: true}, 
			wrapper = shallow(<SidewalkDetailsView {...props}/>),
			renderDrawerDetailsSpy = sandbox.spy(wrapper.instance(), "renderDrawerDetails"),
			renderImageDetailsSpy = sandbox.spy(wrapper.instance(), "renderImageDetails"),
			renderAddressDetailsSpy = sandbox.spy(wrapper.instance(), "renderAddressDetails"),
			renderUploadImageComponentSpy = sandbox.spy(wrapper.instance(), "renderUploadImageComponent"),
			renderRatingsSpy = sandbox.spy(wrapper.instance(), "renderRatings"),
			renderCommentsSpy = sandbox.spy(wrapper.instance(), "renderComments");

		wrapper.setState({
			sidewalkDetails: {test: "test"}
		});

		expect(renderDrawerDetailsSpy.called).to.be.true;
		expect(renderImageDetailsSpy.called).to.be.true;
		expect(renderAddressDetailsSpy.called).to.be.true;
		expect(renderUploadImageComponentSpy.called).to.be.true;
		expect(renderRatingsSpy.called).to.be.true;
		expect(renderCommentsSpy.called).to.be.true;
	});

	it("should not render the drawer when a map is clicked but sidewalk details is null", () => {
		const props={mapClicked: true}, 
		wrapper = shallow(<SidewalkDetailsView {...props}/>),
		renderDrawerDetailsSpy = sandbox.spy(wrapper.instance(), "renderDrawerDetails");

		expect(renderDrawerDetailsSpy.called).to.be.false;
	});

	it("should close the drawer when the icon is clicked", () => {
		const  
		wrapper = shallow(<SidewalkDetailsView/>),
		handleDrawerInteractionSpy = sandbox.spy(wrapper.instance().props, "handleDrawerInteraction");	
		
		wrapper.instance().handleClose();
		expect(handleDrawerInteractionSpy.called).to.be.true;		
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});
