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


    it("should call this.setState when the function is called", () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView/>),
            setStateSpy = sandbox.spy(AdminPanelViewWrapper.instance(), "setState");

        AdminPanelViewWrapper.setState({
            pendingImages: [{id: 0}, {}]
        });

        AdminPanelViewWrapper.instance().getImageIndex(5);
        expect(setStateSpy.called).to.be.true;
        expect(AdminPanelViewWrapper.instance().imageIndex).to.equal(5);

    });

    it("should call adminActions to accept an image upload", () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView/>),
            handlePendingImageStub = sandbox.stub(AdminActions, "handlePendingImages");
        AdminPanelViewWrapper.setState({
            pendingImages: [{id: 0}, {}]
        });
        AdminPanelViewWrapper.instance().handleAccept();
        expect(handlePendingImageStub.called).to.be.true;
    });

    it("should call adminActions to reject an image upload", () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView/>),
            handlePendingImageStub = sandbox.stub(AdminActions, "handlePendingImages");

        AdminPanelViewWrapper.setState({
            pendingImages: [{id: 0}, {}]
        });
        AdminPanelViewWrapper.instance().handleReject();
        expect(handlePendingImageStub.called).to.be.true;
    });
    
    afterEach(() => {
        sandbox.restore();
    })
});