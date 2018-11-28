import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";
import AdminPanelView from "../../../admin/AdminPanelView";
import AdminActions from "../../../admin/AdminActions";

describe("Test the AdminPanelView component", () => {

    let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
    });

    it("should navigate to the login page if not logged in", () => {
		const history = [];
		const AdminPanelViewWrapper = shallow(<AdminPanelView history={history}/>);
        expect(history).to.deep.equal(["/login"]);
    });

    afterEach(() => {
        sandbox.restore();
    })
});