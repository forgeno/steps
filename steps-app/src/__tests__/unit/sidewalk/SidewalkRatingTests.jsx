import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import SidewalkRatingsModal from "../../../sidewalk/SidewalkRatingsModal";
import SidewalkActions from "../../../sidewalk/SidewalkActions";

describe("<SidewalkRatingsModal />", function () {

	let sandbox = null;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("should call the reflux action when the button is clicked for submitting ratings", () => {
		const uploadRatingSpy = sandbox.stub(SidewalkActions, "uploadRatings"),
			wrapper = shallow(<SidewalkRatingsModal />).dive();

		wrapper.setState({
			accessibilityValue: 2,
			connectivityValue: 1,
			comfortValue: 2,
			safetyValue: 3,
			securityValue: 1,
		});
		wrapper.instance()._handleSubmitRating();
		expect(uploadRatingSpy.calledOnce).to.be.true
	});

	afterEach(() => {
		sandbox.restore();
	});
});
