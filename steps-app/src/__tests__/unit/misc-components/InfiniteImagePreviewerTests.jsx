import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import InfiniteImagePreviewer from "../../../misc-components/InfiniteImagePreviewer";


describe("tests the functions in InfiniteImagePreviewer", () => {
	
    let sandbox = null;
    const loadedImagesMock = [{}, {}, {}],
        currentIndexMock = 0;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
    });

    it("should test the handleRightClick and not call loadMoreByArrow", () => {
        const wrapper = 
            shallow(
                <InfiniteImagePreviewer
                    loadedImages={loadedImagesMock}
                    loadMoreImages={() => {}}
                    currentIndex={currentIndexMock}
                    setImagesIndexMock={() => {}}
                    hasMoreImages={false}
                />
            );

        wrapper.setProps({loadMoreByArrow: sandbox.spy()});
        wrapper.instance().handleRightClick();
       
        expect(wrapper.instance().props.loadMoreByArrow.called).to.be.false;
        expect(wrapper.state("start")).to.equal(6);
        expect(wrapper.state("end")).to.equal(11);
        expect(wrapper.state("imageBinIndex")).to.equal(1)
        expect(wrapper.state("previewDirection")).to.equal("right");
    });

    it("should test the handleRightClick and call loadMoreByArrow", () => {
        const wrapper = 
            shallow(
                <InfiniteImagePreviewer
                    loadedImages={loadedImagesMock}
                    loadMoreImages={() => {}}
                    currentIndex={currentIndexMock}
                    setImagesIndexMock={() => {}}
                    hasMoreImages={true}
                />
            );

        wrapper.setProps({loadMoreByArrow: sandbox.spy()});
        wrapper.instance().handleRightClick();
       
        expect(wrapper.instance().props.loadMoreByArrow.called).to.be.true;
        expect(wrapper.state("start")).to.equal(6);
        expect(wrapper.state("end")).to.equal(11);
        expect(wrapper.state("imageBinIndex")).to.equal(1)
        expect(wrapper.state("previewDirection")).to.equal("right");
    });

    it("should test the handleLeftClick and the start indexx should not go below 0", () => {
        const wrapper = 
            shallow(
                <InfiniteImagePreviewer
                    loadedImages={loadedImagesMock}
                    loadMoreImages={() => {}}
                    currentIndex={currentIndexMock}
                    setImagesIndexMock={() => {}}
                    hasMoreImages={true}
                />
            );
        
        wrapper.setState({
            start: 5,
            end: 10,
            imageBinIndex: 1
        });

        wrapper.instance().handleLeftClick();
        expect(wrapper.state("start")).to.equal(0);
        expect(wrapper.state("end")).to.equal(4);
        expect(wrapper.state("imageBinIndex")).to.equal(0)
        expect(wrapper.state("previewDirection")).to.equal("left");
    });

    it("should test the handleLeftClick and the start index decrease properly", () => {
        const wrapper = 
            shallow(
                <InfiniteImagePreviewer
                    loadedImages={loadedImagesMock}
                    loadMoreImages={() => {}}
                    currentIndex={currentIndexMock}
                    setImagesIndexMock={() => {}}
                    hasMoreImages={true}
                />
            );
        
        wrapper.setState({
            start: 7,
            end: 13,
            imageBinIndex: 1
        });

        wrapper.instance().handleLeftClick();
        expect(wrapper.state("start")).to.equal(1);
        expect(wrapper.state("end")).to.equal(7);
        expect(wrapper.state("imageBinIndex")).to.equal(0)
        expect(wrapper.state("previewDirection")).to.equal("left");
    });
    
	afterEach(() => {
		sandbox.restore();
	});
});