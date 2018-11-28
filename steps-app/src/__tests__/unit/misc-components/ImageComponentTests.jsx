import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import ImageComponent from "../../../misc-components/ImageComponent";

describe("tests the functions in ImageCompnent", () => {
    let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
    });

    it("should return the correct CSS classes from calling shouldSelectImageClass", () =>{
        const wrapper = 
            shallow(
                <ImageComponent
                    src={"fakeurl"}
                    index={0}
                    currentImageIndex={0}
                    key={0}
                />);

        wrapper.setProps({
            setImageIndex: () => {},
            loadImagesOnClick: () => {}
        });

        const selectedCSS = wrapper.instance().shouldSelectImageClass();

        expect(selectedCSS).to.equal("infiniteImageRowSelected");
    });

    it("should return the correct CSS classes for images not selected", () => {
        const wrapper = 
            shallow(
                <ImageComponent
                    src={"fakeurl"}
                    index={0}
                    currentImageIndex={5}
                    key={0}
                />);

        wrapper.setProps({
            setImageIndex: () => {},
            loadImagesOnClick: () => {}
        });

        const selectedCSS = wrapper.instance().shouldSelectImageClass();

        expect(selectedCSS).to.equal("infiniteImageRowUnselected");
    });

    it("should call the appropriate props functiosn when handleOnClick is called", () => {
        const wrapper = 
            shallow(
                <ImageComponent
                    src={"fakeurl"}
                    index={0}
                    currentImageIndex={0}
                    key={0}
                />);

                wrapper.setProps({
                        setImageIndex: sandbox.spy(),
                        loadImagesOnClick: sandbox.spy()                
                    });
        
        wrapper.instance().handleOnClick();

        expect(wrapper.instance().props.setImageIndex.called).to.be.true;
        expect(wrapper.instance().props.loadImagesOnClick.called).to.be.true;
    });
    
	afterEach(() => {
		sandbox.restore();
	});
});