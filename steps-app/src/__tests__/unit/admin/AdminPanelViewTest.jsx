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

    it("should call getUnapprovedImages when component mounts", () => {
        const getUnapprovedImagesStub = sandbox.stub(AdminActions, "getUnapprovedImages"),
                AdminPanelViewWrapper = shallow(<AdminPanelView/>);
                
        expect(getUnapprovedImagesStub.called).to.be.true;
    });
    
    afterEach(() => {
        sandbox.restore();
    })
});