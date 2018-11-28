import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import SidewalkRatingsModal from "../../../sidewalk/SidewalkRatingsModal";
import SidewalkActions from "../../../sidewalk/SidewalkActions";
import SpamUtil from "../../../util/SpamUtil";

describe("<SidewalkRatingsModal />", function () {

	let sandbox = null;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("should call the reflux action when the button is clicked for submitting ratings", () => {
		const uploadRatingSpy = sandbox.stub(SidewalkActions, "uploadRatings"),
			wrapper = shallow(<SidewalkRatingsModal />).dive();
		sandbox.stub(SpamUtil, "setLocalStorage");
		sandbox.stub(SpamUtil, "setCookie");

		wrapper.setState({
			accessibilityValue: 2,
			connectivityValue: 1,
			comfortValue: 2,
			safetyValue: 3,
			securityValue: 1,
			currentSidewalk: {
				id: 1
			}
		});
		wrapper.instance()._handleSubmitRating();
		expect(uploadRatingSpy.calledOnce).to.be.true
	});

	afterEach(() => {
		sandbox.restore();
	});
});
