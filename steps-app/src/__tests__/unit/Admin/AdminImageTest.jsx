import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import AdminImage from "../../../admin/AdminImage";

describe("<AdminLoginComponent>", function() {
    let sandbox = null;

    beforeEach( () => {
        sandbox = sinon.createSandbox();
    });

    it("should return the proper css selectors when an previewed image is selected", () => {
        const wrapper = shallow(<AdminImage index={0}/>);

        wrapper.setState({
            currentImageIndex: 0
        });
        
        const shouldHighLightImageResults = wrapper.instance().shouldHighlightImage();

        expect(shouldHighLightImageResults).to.equal("infiniteImageRowSelected");
    });

    it("should return the proper CSS selector when a previewed image is not selected", () => {
        const wrapper = shallow(<AdminImage index={0}/>);

        wrapper.setState({
            currentImageIndex: 5
        });

        const shouldHighLightImageResults = wrapper.instance().shouldHighlightImage();

        expect(shouldHighLightImageResults).to.equal("infiniteImageRowUnselected");
    });

    afterEach(() => {
        sandbox.restore();
    })
});