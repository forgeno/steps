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
			AdminPanelViewWrapper = shallow(<AdminPanelView history={[]}/>);
		AdminPanelViewWrapper.setState({
			isLoggedIn: true
		});
		AdminPanelViewWrapper.instance().componentDidMount();
        expect(getUnapprovedImagesStub.calledOnce).to.be.true;
    });

    it("should call adminActions to accept an image upload", () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView history={[]}/>),
            handlePendingImageStub = sandbox.stub(AdminActions, "handlePendingImages");
        AdminPanelViewWrapper.setState({
            pendingImages: [{id: 0}, {}]
        });
        AdminPanelViewWrapper.instance()._onAcceptImage({id: 0});
        expect(handlePendingImageStub.calledOnce).to.be.true;
		expect(handlePendingImageStub.getCall(0).args[0]).to.be.true;
    });

    it("should call adminActions to reject an image upload", () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView history={[]}/>),
            handlePendingImageStub = sandbox.stub(AdminActions, "handlePendingImages");

        AdminPanelViewWrapper.setState({
            pendingImages: [{id: 0}, {}]
        });
        AdminPanelViewWrapper.instance()._onRejectImage({id: 0});
        expect(handlePendingImageStub.calledOnce).to.be.true;
		expect(handlePendingImageStub.getCall(0).args[0]).to.be.false;
    });
    
    afterEach(() => {
        sandbox.restore();
    })
});