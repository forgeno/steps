import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import InfiniteCarousel from "../../../misc-components/InfiniteCarousel";


describe("tests the functions in InfiniteCarousel", () => {
	
	let sandbox = null;
	const loadMoreImagesMock = () => {},
		setImageIndexMock = () => {},
		loadedImagesMock = [{}, {}, {}];
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
    });
    
    it("should disable the left carousel arrow with proper CSS", () => {
		const wrapper = 
			shallow(
				<InfiniteCarousel 
				loadMoreImages={loadMoreImagesMock} 
				setImamgeIndex={setImageIndexMock}
				loadedImages={loadedImagesMock}
				/>);
		const carouselDirection = wrapper.instance().shouldDisableCarouselArrows(0, 6);
		expect(carouselDirection).to.equal("disableLeftCarouselArrow");
	});

	it("should disable the left carousel arrow with proper CSS", () => {
		const wrapper = 
			shallow(
				<InfiniteCarousel 
				loadMoreImages={loadMoreImagesMock} 
				setImageIndex={setImageIndexMock}
				loadedImages={loadedImagesMock}
				/>);
		const carouselDirection = wrapper.instance().shouldDisableCarouselArrows(59, 60);
		expect(carouselDirection).to.equal("disableRightCarouselArrow");
	});

	it("should not disable any carousel arrow with proper CSS", () => {
		const wrapper = 
			shallow(
				<InfiniteCarousel 
				loadMoreImages={loadMoreImagesMock} 
				setImageIndex={setImageIndexMock}
				loadedImages={loadedImagesMock}
				/>);
		const carouselDirection = wrapper.instance().shouldDisableCarouselArrows(15, 15);
		expect(carouselDirection).to.equal("");
	});

	it("should set the proper state with the carousel when onClick is called", () => {
		const wrapper = 
			shallow(
				<InfiniteCarousel 
				loadMoreImages={loadMoreImagesMock} 
				setImageIndex={setImageIndexMock}
				loadedImages={loadedImagesMock}
				/>);

		wrapper.instance().handleOnClick(4, {direction: "right"});
		expect(wrapper.state("currentImageIndex")).to.equal(4);
		expect(wrapper.state("direction")).to.equal("right");
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});