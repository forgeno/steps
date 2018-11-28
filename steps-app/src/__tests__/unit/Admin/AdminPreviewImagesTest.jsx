import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import AdminPreviewImages from "../../../admin/AdminPreviewImagess";

describe("<AdminLoginComponent>", function() {
    let sandbox = null;

    beforeEach( () => {
        sandbox = sinon.createSandbox();
    });

    it("should keep the index as 0 since the current set has 6 or less images ", () => {
        const wrapper = shallow(<AdminPreviewImages/>);

        wrapper.instance().handleLeftClick();
        expect(wrapper.state("previewDirection")).to.equal("left");
        expect(wrapper.state("start")).to.equal(0);
        expect(wrapper.state("end")).to.equal(1);
        expect(wrapper.state("imageBinIndex")).to.equal(-1);
    });

    it("should decrease the bin index when the left arrow is clicked", () => {
        const wrapper = shallow(<AdminPreviewImages/>);

        wrapper.setState({
            start: 11,
            end: 17,
            imageBinIndex: 2
        });

        wrapper.instance().handleLeftClick();
        expect(wrapper.state("previewDirection")).to.equal("left");
        expect(wrapper.state("start")).to.equal(5);
        expect(wrapper.state("end")).to.equal(11);
        expect(wrapper.state("imageBinIndex")).to.equal(1);
    });

    it("should increase the start and end index by 6 to change images eing previewed but not call getUnapprovedImages", () => {
        const wrapper = shallow(<AdminPreviewImages/>);

        wrapper.setState({
            hasMoreImages: false
        });

        wrapper.instance().handleRightClick()
        expect(wrapper.state("previewDirection")).to.equal("right");
        expect(wrapper.state("start")).to.equal(6);
        expect(wrapper.state("end")).to.equal(11);
        expect(wrapper.state("imageBinIndex")).to.equal(1);
    });

    afterEach(() => {
        sandbox.restore();
    })
});