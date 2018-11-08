import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import SidewalkDetailsView from "../../../sidewalk/SidewalkDetailsView";
import SidewalkActions from "../../../sidewalk/SidewalkActions";

describe("<SidewalkDetailsView />", function () {

	let sandbox = null;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("Should render the drawer when a sidewalk is selected", () => {
		const props = { visible: true },
			wrapper = shallow(<SidewalkDetailsView {...props} />).dive(),
			renderDrawerDetailsSpy = sandbox.spy(wrapper.instance(), "renderDrawerDetails"),
			renderSummaryDetails = sandbox.spy(wrapper.instance(), "renderSummaryDetails");

		wrapper.setState({
			currentSidewalk: {
				test: "test", overallRating: 1, connectivity: 1,
				accessibility: 1, comfort: 1, physicalSafety: 1, senseOfSecurity: 1,
				mobilityTypeDistribution: [],
				comments: [{ id: 12, text: "awkiokwaoekoawpe", date: "2018-10-21T22:09:35.892271Z" },
				{ id: 13, text: "awkiokwaoekoawpe", date: "2018-10-23T22:09:35.892271Z" }]
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


	it("should close the drawer when the icon is clicked", () => {
		const spy = sandbox.spy();
		const wrapper = shallow(<SidewalkDetailsView onClose={spy} />).dive();

		wrapper.instance()._handleClose();
		expect(spy.calledOnce).to.be.true;
	});


	it("should set the state to close when called hendle close", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.setState({
			open: true
		});

		wrapper.instance().handleClose();
		expect(wrapper.state("open")).to.equal(false);
	});

	it("should set the state to open when called handle open", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		wrapper.setState({
			open: false
		});

		wrapper.instance().handleClickOpen();
		expect(wrapper.state("open")).to.equal(true);
	});


	it("should call the reflux action when the button is clicked for submitting ratings", () => {
		const uploadRatingSpy = sandbox.stub(SidewalkActions, "uploadRatings"),
			wrapper = shallow(<SidewalkDetailsView />).dive();

		wrapper.setState({
			accessibilityValue: 2,
			connectivityValue: 1,
			comfortValue: 2,
			safetyValue: 3,
			securityValue: 1,
		});
		wrapper.instance()._handleSubmitRating();
		expect(uploadRatingSpy.called).to.be.true
	});

	/**
	 * TO-DO Need to investigate change handler
	
	it("should set the state of the value to the proper string", () => {
		const wrapper = shallow(<SidewalkDetailsView />).dive();
		const testObject = {
			target: { accessibilityValue:",2" }
		};
		wrapper.setState({
			accessibilityValue: 3,
		});
		wrapper.instance().changeAccessibility(testObject);
		console.error(wrapper.state())
		expect(wrapper.state("accessibilityValue")).to.equal(2);
	});

	*/



	afterEach(() => {
		sandbox.restore();
	});
});
