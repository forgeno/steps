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

    it("should call the appropriate functions when handleOnClick is called", () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView history={[]}/>),
            loadMoreImagesStub = sandbox.stub(AdminPanelViewWrapper.instance(), "loadMoreImages"),
            adminImageClickedStub = sandbox.stub(AdminActions, "adminImageClicked");

        AdminPanelViewWrapper.instance().handleOnClick(0, {direction: "right"});
        expect(loadMoreImagesStub.called).to.be.true;
        expect(adminImageClickedStub.called).to.be.true;
    });

    it("should disable the left carousel with CSS if the first image is displayed" , () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView history={[]}/>);
        const carouselCSS = AdminPanelViewWrapper.instance().shouldDisableCarouselArrows(0, 0);
        expect(carouselCSS).to.equal("disableLeftCarouselArrow");
    });

    it("should disable the right carousel with css if the last image is displayed", () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView history={[]}/>);
        const pendingImagesMock = [{}, {}, {}, {}],
            pendingImagesLength = pendingImagesMock.length;
        const carouselCSS = AdminPanelViewWrapper.instance().shouldDisableCarouselArrows(3, pendingImagesLength);
        expect(carouselCSS).to.equal("disableRightCarouselArrow");
    });

    it("should not disable any carousel arrows when the current index is not the first or last image", () => {
        const AdminPanelViewWrapper = shallow(<AdminPanelView history={[]}/>);
        const pendingImagesMock = [{}, {}, {}, {}],
            pendingImagesLength = pendingImagesMock.length;
        const carouselCSS = AdminPanelViewWrapper.instance().shouldDisableCarouselArrows(1, pendingImagesLength);
        expect(carouselCSS).to.equal("");
    });
    
    afterEach(() => {
        sandbox.restore();
    })
});