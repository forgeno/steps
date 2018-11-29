import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import SidewalkUploadedImagesGallery from "../../../sidewalk/images/SidewalkUploadedImagesGallery";
import SidewalkActions from "../../../sidewalk/SidewalkActions";

describe("<SidewalkUploadedImagesGallery />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Tests that visibility props are propogated correctly when the component is not visible", () => {
		const wrapper = shallow(<SidewalkUploadedImagesGallery visible={false} />);
		wrapper.instance().stores[0].setState({
			currentSidewalk: {
			},
			loadeduserImages: []
		});
		console.error(wrapper.debug());
		expect(wrapper.find("WithStyles(InfiniteImageGalleryCarousel)").prop("visible")).to.be.false;
		expect(wrapper.find("ImageDeletionModal").prop("visible")).to.be.false;
	});
	
	it("Tests that visibility props are propogated correctly when the component is visible", () => {
		const wrapper = shallow(<SidewalkUploadedImagesGallery visible={true} />);
		wrapper.instance().stores[0].setState({
			currentSidewalk: {
			},
			loadeduserImages: []
		});
		wrapper.setState({
			modalOpened: true
		});
		expect(wrapper.find("WithStyles(InfiniteImageGalleryCarousel)").prop("visible")).to.be.true;
		expect(wrapper.find("ImageDeletionModal").prop("visible")).to.be.true;
	});
	
	it("Tests that the image deletion modal is not rendered if the state is not set to open", () => {
		const wrapper = shallow(<SidewalkUploadedImagesGallery visible={true} />);
		wrapper.instance().stores[0].setState({
			currentSidewalk: {
			},
			loadeduserImages: []
		});
		expect(wrapper.find("WithStyles(InfiniteImageGalleryCarousel)").prop("visible")).to.be.true;
		expect(wrapper.find("ImageDeletionModal").prop("visible")).to.be.false;
	});
	
	it("Tests that the state is updated correctly if _onDeleteImageClicked is called", () => {
		const wrapper = shallow(<SidewalkUploadedImagesGallery visible={true} />),
			imageObj = {};
		wrapper.instance().stores[0].setState({
			currentSidewalk: {
			},
			loadeduserImages: []
		});
		wrapper.instance()._onDeleteImageClicked(imageObj);
		expect(wrapper.state("modalOpened")).to.be.true;
		expect(wrapper.state("selectedImage")).to.be.equal(imageObj);
	});
	
	it("Tests that the state is updated correctly if _onModalClosed is called when an image is not deleted", () => {
		const wrapper = shallow(<SidewalkUploadedImagesGallery visible={true} />);
		wrapper.instance().stores[0].setState({
			currentSidewalk: {
			},
			loadeduserImages: []
		});
		wrapper.instance()._onModalClosed(false);
		expect(wrapper.state("modalOpened")).to.be.false;
		expect(wrapper.state("selectedImage")).to.be.equal(null);
	});
	
	it("Tests that the state is updated correctly if _onModalClosed is called when an image is deleted", () => {
		const wrapper = shallow(<SidewalkUploadedImagesGallery visible={true} />);
		wrapper.instance().stores[0].setState({
			currentSidewalk: {
			},
			loadeduserImages: []
		});
		sandbox.spy(SidewalkActions, "removeLoadedImage");
		wrapper.instance()._onModalClosed(true);
		
		expect(wrapper.state("modalOpened")).to.be.false;
		expect(wrapper.state("selectedImage")).to.be.equal(null);
		expect(SidewalkActions.removeLoadedImage.calledOnce).to.be.true;
	});
	
	it("Tests that _renderDeleteButton doesn't render something if the user is not logged in as an administrator", () => {
		const wrapper = shallow(<SidewalkUploadedImagesGallery visible={true} />);
		wrapper.instance().stores[0].setState({
			currentSidewalk: {
			},
			loadeduserImages: []
		});
		wrapper.instance().stores[1].setState({
			isLoggedIn: false
		});
		expect(wrapper.instance()._renderDeleteButton(true, {})).to.be.null;
	});
	
	it("Tests that _renderDeleteButton renders a button if the user is logged in", () => {
		const wrapper = shallow(<SidewalkUploadedImagesGallery visible={true} />);
		sandbox.spy(wrapper.instance(), "_onDeleteImageClicked");
		wrapper.instance().stores[0].setState({
			currentSidewalk: {
			},
			loadeduserImages: []
		});
		wrapper.instance().stores[1].setState({
			isLoggedIn: true
		});
		
		expect(wrapper.instance()._renderDeleteButton(true, {})).to.not.be.null;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});