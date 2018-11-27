import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import swearsList from "bad-words/lib/lang";

import CommentsListComponent from "../../../sidewalk/comments/CommentsListComponent";
import SidewalkActions from "../../../sidewalk/SidewalkActions";
import SidewalkStore from "../../../sidewalk/SidewalkStore";

describe("<CommentsListComponent />", function() {
	
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("should return failure if the comment is empty", () =>{
		const wrapper = shallow(<CommentsListComponent/>);
		const output = wrapper.instance()._validateCommentState(""); 
		expect(output.state).to.equal("error");
		expect(output.message).to.have.string("empty");
	});
	
	it("should return success if the length of the comment is less than 301 characters", () =>{
		const wrapper = shallow(<CommentsListComponent/>);
		const output = wrapper.instance()._validateCommentState("a"); 
		expect(output.state).to.equal("success");
		expect(output.message).to.be.equal("");
	});

	it("should return error if the length of the comment is more than 300", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		const output = wrapper.instance()._validateCommentState("abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz");
		expect(output.state).to.equal("error");
		expect(output.message).to.have.string("300 characters");
	});
	
	it("should set the state of the value to the proper string", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		sandbox.spy(wrapper.instance(), "_validateCommentState");
		wrapper.update();
		const testObject = {
			target: {value: "test string"}
			};

		wrapper.instance()._handleChange(testObject);
		expect(wrapper.state("enteredComment")).to.equal("test string");
		expect(wrapper.instance()._validateCommentState.calledOnce).to.be.true;
	});

	it("should call the reflux action when the button is clicked for submitting comments", () => {
		const uploadCommentSpy = sandbox.stub(SidewalkActions, "uploadComment"),
			 wrapper = shallow(<CommentsListComponent/>);

		wrapper.setState({
			enteredComment: "test string",
		});

		wrapper.instance()._handleSubmit();
		expect(uploadCommentSpy.calledOnce).to.be.true
	});

	it("Should disable submit button when personal information is detected", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		wrapper.setState({
			currentSidewalk: {
				id: "2",
				comments: []
			}
		});
		wrapper.instance()._handleChange({target: {value: "799-999-9999 is a very non suspicious phone number please call it"}});
		expect(wrapper.find("Button").prop("disabled")).to.be.true;
	});

	it("Should not disable the submit button when the entered comment is valid", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		wrapper.setState({
			currentSidewalk: {
				id: "2",
				comments: []
			}
		});
		wrapper.instance()._handleChange({target: {value: "this has no bad words"}});
		expect(wrapper.find("Button").prop("disabled")).to.be.false;
	});
	
	it("tests the comment validation returning an error if a phone number is detected", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		const output = wrapper.instance()._validateCommentState("some random text 587-1111-2312 and 780-231-4123");
		expect(output.state).to.equal("error");
		expect(output.message).to.have.string("phone number");
	});

	it("tests the comment validation returning an error if an email address is detected", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		const output = wrapper.instance()._performDetailedCommentValidation("hey i love pizza, email me at johnpizzaco@gmail.com");
		expect(output.state).to.equal("error");
		expect(output.message).to.have.string("personal info");
	});

	it("tests the detailed comment validation for swear substrings with a word that should be blocked", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		swearsList.words = ["buffoon"];
		const output = wrapper.instance()._performDetailedCommentValidation("buffoonn");
		expect(output.state).to.equal("error");
		expect(output.message).to.have.string("profanity");
	});
	
	it("tests the detailed comment validation for swear substrings with a word that should not be blocked", () => {
		const wrapper = shallow(<CommentsListComponent/>);
		swearsList.words = ["buffoon"];
		const output = wrapper.instance()._performDetailedCommentValidation("hello");
		expect(output.state).to.equal("success");
		expect(output.message).to.be.equal("");
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
	
	it("tests validating substring swears after blurring the comment input with a valid input", () => {
		const wrapper = shallow(<CommentsListComponent />);
		const obj = {
			message: "",
			state: "success"
		};
		sandbox.stub(wrapper.instance(), "_performDetailedCommentValidation").returns(obj);
		wrapper.update();
		wrapper.instance()._onCommentBlur();
		expect(wrapper.state("commentValidation")).to.not.equal(obj);
	});
	
	it("tests validating substring swears after blurring the comment input with an invalid input", () => {
		const wrapper = shallow(<CommentsListComponent />);
		const obj = {
			message: "",
			state: "error"
		};
		sandbox.stub(wrapper.instance(), "_performDetailedCommentValidation").returns(obj);
		wrapper.update();
		wrapper.instance()._onCommentBlur();
		expect(wrapper.state("commentValidation")).to.equal(obj);
	});
	
	it("tests submitting the entered comment with a swear", () => {
		const uploadCommentSpy = sandbox.stub(SidewalkActions, "uploadComment");
		const wrapper = shallow(<CommentsListComponent />);
		const validation = {
			message: "error",
			state: "error"
		};
		sandbox.stub(wrapper.instance(), "_performDetailedCommentValidation").returns(validation);
		wrapper.update();
		wrapper.instance()._handleSubmit();
		expect(wrapper.state("commentValidation")).to.be.equal(validation);
		expect(uploadCommentSpy.notCalled).to.be.true;
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});
