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
	
	// TODO: uncomment these when image uploading is implemented
	/*it("Makes sure _openImageModal sets the modal visible state to true", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.instance()._openImageModal();
		expect(wrapper.state("modalOpened")).to.be.true;
	});
	
	it("Makes sure _closeImageModal sets the modal visible state to false", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.instance()._closeImageModal();
		expect(wrapper.state("modalOpened")).to.be.false;
	});
	
	it("Makes sure _closeImageModal invokes an action when it is called with an argument", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		const spy = sandbox.spy(SidewalkActions, "uploadSidewalkImage");
		wrapper.instance()._closeImageModal("a");
		
		expect(spy.calledOnce).to.be.true;
		expect(spy.getCall(0).args[0]).to.be.equal("a");
	});
	
	it("Makes sure _closeImageModal does not invoke an action when it is not called with an argument", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		const spy = sandbox.spy(SidewalkActions, "uploadSidewalkImage");
		wrapper.instance()._closeImageModal();
		
		expect(spy.notCalled).to.be.true;
	});
	
	it("Makes sure _viewImages displays the uploaded images for this sidewalk", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.instance()._viewImages();
		expect(wrapper.state("viewingImages")).to.be.true;
		expect(wrapper.find("SidewalkImagesView").prop("visible")).to.be.true;
	});
	
	it("Makes sure _closeImages displays the uploaded images for this sidewalk", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.instance()._viewImages();
		wrapper.instance()._closeImages();
		expect(wrapper.state("viewingImages")).to.be.false;
		expect(wrapper.find("SidewalkImagesView").prop("visible")).to.be.false;
	});
	
	it("Makes sure a loading spinner displays while an image is being uploaded", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.setState({
			uploadingSidewalkImage: true
		});
		expect(wrapper.find("LoaderComponent")).to.have.lengthOf(1);
	});
	
	it("Makes sure a loading spinner does not display if no image is being uploaded", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.setState({
			uploadingSidewalkImage: false
		});
		expect(wrapper.find("LoaderComponent")).to.have.lengthOf(0);
	});
	
	it("Makes sure an alert displays if an error happened uploading an image", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.setState({
			uploadedImageError: true
		});
		expect(wrapper.find("Alert")).to.have.lengthOf(1);
	});
	
	it("Makes sure an alert does not display if an error did not happen uploading an image", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.setState({
			uploadedImageError: false
		});
		expect(wrapper.find("Alert")).to.have.lengthOf(0);
	});*/

	it("Should render the drawer when a sidewalk is selected", () => {
		const props = {visible: true}, 
			wrapper = shallow(<SidewalkDetailsView {...props}/>).dive(),
			renderDrawerDetailsSpy = sandbox.spy(wrapper.instance(), "renderDrawerDetails"),
			renderSummaryDetails = sandbox.spy(wrapper.instance(), "renderSummaryDetails");

		wrapper.setState({
			currentSidewalk: {
				test: "test", overallRating: 1, connectivity: 1,
				accessibility: 1, comfort: 1, physicalSafety: 1, senseOfSecurity: 1,
				mobilityTypeDistribution: [],
				comments: [{id: 12, text: "awkiokwaoekoawpe", date: "2018-10-21T22:09:35.892271Z"},
				{id: 13, text: "awkiokwaoekoawpe", date: "2018-10-23T22:09:35.892271Z"}]
			}
		});

		expect(renderSummaryDetails.called).to.be.true;
	});

	it("should close the drawer when the icon is clicked", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<SidewalkDetailsView onClose={spy} />).dive();
		
		wrapper.instance()._handleClose();
		expect(spy.calledOnce).to.be.true;		
	});

	it("should return success if the length of the comment is less than 301 characters", () =>{
		const wrapper = shallow(<SidewalkDetailsView/>).dive();

		wrapper.setState({
			value: {length: 299}
		});

		const output = wrapper.instance().getCommentLength(); 
		expect(output).to.equal("success");
	});

	it("should return error if the length of the comment is more than 300", () => {
		const wrapper = shallow(<SidewalkDetailsView/>).dive();

		wrapper.setState({
			value: {
				length: 301
			}
		});

		const output = wrapper.instance().getCommentLength();
		expect(output).to.equal("error");
	});
	
	it("should set the state of the value to the proper string", () => {
		const wrapper = shallow(<SidewalkDetailsView/>).dive();
		const testObject = {
			target: {value: "test string"}
			};

		wrapper.instance().handleChange(testObject);
		expect(wrapper.state("value")).to.equal("test string");
	});

	it("should call the reflux action when the button is clicked for submitting comments", () => {
		const uploadCommentSpy = sandbox.spy(SidewalkActions, "uploadComment"),
			 wrapper = shallow(<SidewalkDetailsView/>).dive();

		wrapper.setState({
			value: "test string",
		});

		wrapper.instance().handleSubmit();

		expect(uploadCommentSpy.called).to.be.true
	});

	afterEach(() => {
		sandbox.restore();
	});
});
