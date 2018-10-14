import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import ImageSelectorComponent from "../../../images/ImageSelectorComponent";

describe("<ImageSelectorComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Makes sure clicking the button opens up a file selection", () => {
		const wrapper = shallow(<ImageSelectorComponent onSelect={() => {}} />);
		const spy = sandbox.spy();
		wrapper.instance().fileInput = {click: spy};
		wrapper.find("Button").simulate("click");
		expect(spy.calledOnce).to.be.true;
	});
	
	it("Makes sure that the props onSelect() method is invoked when a file is selected", () => {
		const spy = sandbox.spy();
		const event = {target: {value: 1}};
		const wrapper = shallow(<ImageSelectorComponent onSelect={spy} />);
		
		wrapper.find("input[type='file']").simulate("change", event);
		expect(spy.calledOnce).to.be.true;
		expect(spy.args[0][0]).to.be.equal(event);
	});
	
	it("Makes sure that the unselected file text shows up", () => {
		const wrapper = shallow(<ImageSelectorComponent />);
		expect(wrapper.find("FormControl").props().placeholder).to.be.equal("No file selected");
	});
	
	it("Makes sure that the selected file text shows up", () => {
		const wrapper = shallow(<ImageSelectorComponent fileName="test file.png" />);
		expect(wrapper.find("FormControl").props().placeholder).to.be.equal("test file.png");
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});