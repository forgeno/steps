import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import CommentsListComponent from "../../../sidewalk/CommentsListComponent";
import SidewalkActions from "../../../sidewalk/SidewalkActions";
import SidewalkStore from "../../../sidewalk/SidewalkStore";

describe("<CommentsListComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("should return success if the length of the comment is less than 301 characters", () =>{
		const wrapper = shallow(<CommentsListComponent/>);

		wrapper.setState({
			enteredComment: {length: 299}
		});

		const output = wrapper.instance()._validateCommentState(); 
		expect(output).to.equal("success");
	});

	it("should return error if the length of the comment is more than 300", () => {
		const wrapper = shallow(<CommentsListComponent/>);

		wrapper.setState({
			enteredComment: {
				length: 301
			}
		});

		const output = wrapper.instance()._validateCommentState();
		expect(output).to.equal("error");
	});
	
	it("should set the state of the value to the proper string", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		const testObject = {
			target: {value: "test string"}
			};

		wrapper.instance()._handleChange(testObject);
		expect(wrapper.state("enteredComment")).to.equal("test string");
	});

	it("should call the reflux action when the button is clicked for submitting comments", () => {
		const uploadCommentSpy = sandbox.stub(SidewalkActions, "uploadComment"),
			 wrapper = shallow(<CommentsListComponent/>);

		wrapper.setState({
			enteredComment: "test string",
		});

		wrapper.instance()._handleSubmit();
		expect(uploadCommentSpy.called).to.be.true
	});

	it("should call a sidewalk action when the delete comment confirmation modal was closed successfully", () => {
		const removeCommentSpy = sandbox.stub(SidewalkActions, "removeLoadedComment"),
			wrapper = shallow(<CommentsListComponent />),
			comment = {
				id: "stuff"
			};
		wrapper.instance()._openConfirmationModal(comment);
		wrapper.instance()._closeConfirmationModal(true);
		expect(removeCommentSpy.calledOnce).to.be.true;
		expect(removeCommentSpy.getCall(0).args[0]).to.be.equal(comment);
	});
	
	it("should not call a sidewalk action when the delete comment confirmation modal was closed unsuccessfully", () => {
		const removeCommentSpy = sandbox.stub(SidewalkActions, "removeLoadedComment"),
			wrapper = shallow(<CommentsListComponent />),
			comment = {
				id: "stuff"
			};
		wrapper.instance()._openConfirmationModal(comment);
		wrapper.instance()._closeConfirmationModal();
		expect(removeCommentSpy.notCalled).to.be.true;
	});
	
	it("should render the modal when a comment is attempting to be deleted", () => {
		const wrapper = shallow(<CommentsListComponent />),
			comment = {
				id: "stuff",
				text: "moreStuff"
			};
		wrapper.instance().store.singleton.setState({
			currentSidewalk: {
				comments: []
			}
		});
		wrapper.instance()._openConfirmationModal(comment);
		expect(wrapper.find("CommentDeletionModal").props().visible).to.be.true;
	});
	
	it("should not render the modal when a comment is not attempting to be deleted", () => {
		const wrapper = shallow(<CommentsListComponent />);
		wrapper.instance().store.singleton.setState({
			currentSidewalk: {
				comments: []
			}
		});
		expect(wrapper.find("CommentDeletionModal").props().visible).to.be.false;
	});
	
	it("should not render the modal after it is closed", () => {
		const wrapper = shallow(<CommentsListComponent />),
			comment = {
				id: "stuff",
				text: "moreStuff"
			};
		wrapper.instance().store.singleton.setState({
			currentSidewalk: {
				comments: []
			}
		});
		sandbox.stub(SidewalkActions, "removeLoadedComment");
		wrapper.instance()._openConfirmationModal(comment);
		wrapper.instance()._closeConfirmationModal(true);
		expect(wrapper.find("CommentDeletionModal").props().visible).to.be.false;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});
