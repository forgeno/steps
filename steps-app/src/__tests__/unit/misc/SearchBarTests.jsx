import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import SearchBarComponent from "../../../misc-components/SearchBarComponent";

describe("<SearchBarComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Makes sure the search bar is not visible if searchVisible is false", () => {
		const wrapper = shallow(<SearchBarComponent />);
		wrapper.setState({
			searchVisible: false
		});
		expect(wrapper.instance().render()).to.be.null;
	});
	
	it("Makes sure that the search bar is visible if searchVisible is true", () => {
		const wrapper = shallow(<SearchBarComponent />);
		wrapper.setState({
			searchVisible: true
		});
		expect(wrapper.find("div")).to.have.lengthOf(1);
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});