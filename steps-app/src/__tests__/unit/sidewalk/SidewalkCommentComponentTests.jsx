import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import SidewalkCommentComponent from "../../../sidewalk/SidewalkCommentComponent";
import CloseIcon from "@material-ui/icons/Close";

const COMMENT_DETAILS = {
	date: "2012-01-01",
	text: "test"
};

describe("<SidewalkCommentComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("should render the delete icon if the user is logged in as an administrator", () =>{
		const wrapper = shallow(<SidewalkCommentComponent details={COMMENT_DETAILS} />);
		wrapper.instance().store.singleton.setState({
			isLoggedIn: true
		});
		expect(wrapper.find(CloseIcon)).to.have.lengthOf(1);
	});

	it("should not render the delete icon if the user is not logged in as an administrator", () =>{
		const wrapper = shallow(<SidewalkCommentComponent details={COMMENT_DETAILS} />);
		wrapper.instance().store.singleton.setState({
			isLoggedIn: undefined
		});
		expect(wrapper.find(CloseIcon)).to.have.lengthOf(0);
	});
	
	it("should call onDelete with the comment details if the delete icon is clicked", () =>{
		const deleteSpy = sandbox.spy(),
			wrapper = shallow(<SidewalkCommentComponent onDelete={deleteSpy} details={COMMENT_DETAILS} />);
		wrapper.instance().store.singleton.setState({
			isLoggedIn: true
		});
		wrapper.find(CloseIcon).simulate("click");
		expect(deleteSpy.calledOnce).to.be.true;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});
