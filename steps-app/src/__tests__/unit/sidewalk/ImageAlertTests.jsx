import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import UploadedImageSuccessComponent from "../../../sidewalk/images/UploadedImageSuccessComponent";
import UploadedImageErrorComponent from "../../../sidewalk/images/UploadedImageErrorComponent";
import ImageDeleteSuccessComponent from "../../../sidewalk/images/ImageDeleteSuccessComponent";
import ImageDeleteErrorComponent from "../../../sidewalk/images/ImageDeleteErrorComponent";

describe("<UploadedImageSuccessComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Should render the image upload success alert when an image is successfully uploaded", () => {
		const wrapper = shallow(<UploadedImageSuccessComponent />);
		wrapper.instance().store.singleton.setState({
			uploadImageSucceeded: true
		});
		expect(wrapper.find("SuccessAlertComponent").prop("visible")).to.be.true;
	});

	it("Should not render the image upload success alert when an image is not successfully uploaded", () => {
		const wrapper = shallow(<UploadedImageSuccessComponent />);
		wrapper.instance().store.singleton.setState({
			uploadImageSucceeded: false
		});
		expect(wrapper.find("SuccessAlertComponent").prop("visible")).to.be.false;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});

describe("<UploadedImageErrorComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Should render the image upload error alert when an image fails to upload", () => {
		const wrapper = shallow(<UploadedImageErrorComponent />);
		wrapper.instance().store.singleton.setState({
			uploadedImageError: true
		});
		expect(wrapper.find("ErrorAlertComponent").prop("visible")).to.be.true;
	});

	it("Should not render the image upload error alert when an image does not fail to upload", () => {
		const wrapper = shallow(<UploadedImageErrorComponent />);
		wrapper.instance().store.singleton.setState({
			uploadedImageError: false
		});
		expect(wrapper.find("ErrorAlertComponent").prop("visible")).to.be.false;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});

describe("<ImageDeleteSuccessComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Should render the image delete success alert when an image is successfully deleted", () => {
		const wrapper = shallow(<ImageDeleteSuccessComponent />);
		wrapper.instance().store.singleton.setState({
			successfullyDeletedImage: true
		});
		expect(wrapper.find("SuccessAlertComponent").prop("visible")).to.be.true;
	});

	it("Should not render the image delete success alert when an image is not successfully deleted", () => {
		const wrapper = shallow(<ImageDeleteSuccessComponent />);
		wrapper.instance().store.singleton.setState({
			successfullyDeletedImage: false
		});
		expect(wrapper.find("SuccessAlertComponent").prop("visible")).to.be.false;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});

describe("<ImageDeleteErrorComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Should render the image delete error alert when an image fails to delete", () => {
		const wrapper = shallow(<ImageDeleteErrorComponent />);
		wrapper.instance().store.singleton.setState({
			failedDeleteImage: true
		});
		expect(wrapper.find("ErrorAlertComponent").prop("visible")).to.be.true;
	});

	it("Should not render the image delete error alert when an image does not fail to delete", () => {
		const wrapper = shallow(<ImageDeleteErrorComponent />);
		wrapper.instance().store.singleton.setState({
			failedDeleteImage: false
		});
		expect(wrapper.find("ErrorAlertComponent").prop("visible")).to.be.false;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});