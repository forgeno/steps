import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import ImageUploadModal from "../../../images/ImageUploadModal";
import {MAX_UPLOAD_SIZE} from "../../../constants/DatabaseConstants";
import * as FileUtilities from "../../../util/FileUtilities";

describe("<ImageUploadModal />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Makes sure that the file size alert is rendered if the selected file size is too large", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			selectedImageSize: MAX_UPLOAD_SIZE + 1
		});
		expect(wrapper.find("Alert")).to.have.lengthOf(1);
	});
	
	it("Makes sure that the file size alert is not rendered if the selected file size is not too large", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			selectedImageSize: MAX_UPLOAD_SIZE
		});
		expect(wrapper.find("Alert")).to.have.lengthOf(0);
	});
	
	it("Makes sure that the selected image is previewed if it exists", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			selectedImage: "a"
		});
		expect(wrapper.find("img")).to.have.lengthOf(1);
	});
	
	it("Makes sure that no image preview is rendered if an image is not selected", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		expect(wrapper.find("img")).to.have.lengthOf(0);
	});
	
	it("Makes sure that a loading spinner is rendered while the selected image is being processed", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			loadingSelectedImage: true
		});
		expect(wrapper.find("LoaderComponent")).to.have.lengthOf(1);
	});
	
	it("Makes sure the cancel button does not upload the image", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<ImageUploadModal onClose={spy} />).dive();
		wrapper.setState({
			selectedImage: "a"
		});
		wrapper.find("Button").at(0).simulate("click");
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args).to.deep.equal([]);
	});
	
	it("Makes sure the submit button uploads the image", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<ImageUploadModal onClose={spy} />).dive();
		wrapper.setState({
			selectedImage: "abc;base64,a"
		});
		wrapper.find("Button").at(1).simulate("click");
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args).to.deep.equal(["abc;base64,a"]);
	});
	
	it("Tests _selectImageToUpload with an image that is valid", () => {
		sandbox.stub(FileUtilities, "getFile").returns({then: (callback) => {callback("a")}});
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.instance()._selectImageToUpload({
			target: {
				files: [{
					size: 1,
					name: "fileName"
				}]
			}
		});
		expect(wrapper.state()).to.deep.equal({
			selectedImage: "a",
			selectedImageSize: 1,
			loadingSelectedImage: false,
			selectedFileName: "fileName"
		});
	});
	
	it("Tests _selectImageToUpload with an image that is too large", () => {
		sandbox.stub(FileUtilities, "getFile").returns({then: (callback) => {callback("a")}});
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.instance()._selectImageToUpload({
			target: {
				files: [{
					size: MAX_UPLOAD_SIZE + 1,
					name: "fileName"
				}]
			}
		});
		expect(wrapper.state()).to.deep.equal({
			selectedImage: null,
			selectedImageSize: MAX_UPLOAD_SIZE + 1,
			loadingSelectedImage: false,
			selectedFileName: "fileName"
		});
	});
	
	it("Tests _selectImageToUpload with no selected image", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.instance()._selectImageToUpload({
			target: {
				files: []
			}
		});
		expect(wrapper.state()).to.deep.equal({
			selectedImage: null,
			selectedImageSize: undefined,
			loadingSelectedImage: false,
			selectedFileName: undefined
		});
	});
	
	it("Tests _shouldDisplaySizeWarning when a warning should not be displayed", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			selectedImageSize: MAX_UPLOAD_SIZE - 1
		});
		expect(wrapper.instance()._shouldDisplaySizeWarning()).to.be.false;
	});
	
	it("Tests _shouldDisplaySizeWarning when a warning should be displayed", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			selectedImageSize: MAX_UPLOAD_SIZE + 1
		});
		expect(wrapper.instance()._shouldDisplaySizeWarning()).to.be.true;
	});
	
	it("Tests _canUpload when an image can be uploaded", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			selectedImageSize: MAX_UPLOAD_SIZE - 1,
			selectedImage: "a"
		});
		expect(wrapper.instance()._canUpload()).to.be.true;
	});
	
	it("Tests _canUpload when an image can not be uploaded due to the size being too large", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			selectedImageSize: MAX_UPLOAD_SIZE + 1,
			selectedImage: "a"
		});
		expect(wrapper.instance()._canUpload()).to.be.false;
	});
	
	it("Tests _canUpload when an image can not be uploaded due to no image being selected", () => {
		const wrapper = shallow(<ImageUploadModal />).dive();
		wrapper.setState({
			selectedImageSize: MAX_UPLOAD_SIZE - 1,
			selectedImage: null
		});
		expect(wrapper.instance()._canUpload()).to.be.false;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});