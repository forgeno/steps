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

	afterEach(() => {
		sandbox.restore();
	});
});
