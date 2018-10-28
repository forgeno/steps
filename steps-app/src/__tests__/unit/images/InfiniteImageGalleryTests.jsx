import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import InfiniteImageGallery from "../../../images/InfiniteImageGallery";
import LoaderComponent from "../../../misc-components/LoaderComponent";

describe("<InfiniteImageGallery />", function() {
	
	let sandbox = null;
	let wrapper = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
		sandbox.stub(React, "createRef").returns({current: {
			focus: () => null
		}});
		wrapper = shallow(<InfiniteImageGallery isNextPageLoading={false}
			loadMoreData={sandbox.spy()}
			visible={true} onClose={sandbox.spy()} hasNextPage={true} loadedImages={[]} />);
	});
	
	describe("Tests _handleKeyDown", function() {
		
		["ArrowRight", "ArrowDown"].forEach((key) => {
			it(`Tests with ${key} when nothing else needs to be loaded`, () => {
				sandbox.spy(wrapper.instance(), "setState");
				wrapper.instance().render();
				wrapper.instance()._handleKeyDown({key: key});
				expect(wrapper.instance().setState.calledOnce).to.be.true;
				expect(wrapper.instance().setState.getCall(0).args[0]).to.deep.equal({
					currentImageIndex: 1
				});
			});
			
			it(`Tests with ${key} when more images need to be loaded`, () => {
				wrapper.setState({
					currentImageIndex: 1
				});
				sandbox.spy(wrapper.instance(), "setState");
				wrapper.setProps({
					loadedImages: [{}, {}]
				});
				sandbox.stub(wrapper.instance(), "_loadMoreRows");
				wrapper.instance().render();
				wrapper.instance()._handleKeyDown({key: key});
				expect(wrapper.instance().setState.calledOnce).to.be.true;
				expect(wrapper.instance().setState.getCall(0).args[0]).to.deep.equal({
					currentImageIndex: 2
				});
				expect(wrapper.instance()._loadMoreRows.calledOnce).to.be.true;
				expect(wrapper.instance()._loadMoreRows.getCall(0).args[0]).to.deep.equal({
					startIndex: 2,
					endIndex: 2
				});
			});
		});
		
		["ArrowLeft", "ArrowUp"].forEach((key) => {
			it(`Tests with ${key} when the current image is the first one`, () => {
				sandbox.spy(wrapper.instance(), "setState");
				wrapper.instance().render();
				wrapper.instance()._handleKeyDown({key: key});
				expect(wrapper.instance().setState.notCalled).to.be.true;
			});
			
			it(`Tests with ${key} when the current image is not the first one`, () => {
				wrapper.setState({
					currentImageIndex: 1
				});
				sandbox.spy(wrapper.instance(), "setState");
				wrapper.instance().render();
				wrapper.instance()._handleKeyDown({key: key});
				expect(wrapper.instance().setState.calledOnce).to.be.true;
				expect(wrapper.instance().setState.getCall(0).args[0]).to.deep.equal({
					currentImageIndex: 0
				});
			});
		});
		
		it("Tests to make sure the component is exited when the escape key is pressed", () => {
			wrapper.setProps({onClose: sandbox.spy()});
			wrapper.instance()._handleKeyDown({key: "Escape"});
			expect(wrapper.instance().props.onClose.calledOnce).to.be.true;
		});
	});
	
	it("Tests _onImageClicked updating the current image index", () => {
		wrapper.instance()._onImageClicked(4);
		expect(wrapper.state("currentImageIndex")).to.be.equal(4);
	});
	
	it("Tests _isRowLoaded with an unloaded item", () => {
		expect(wrapper.instance()._isRowLoaded({index: 4})).to.be.false;
	});
	
	it("Tests _isRowLoaded with a loaded item", () => {
		wrapper.setProps({
			loadedImages: [{}, {}, {}, {}, {a: true}]
		});
		expect(wrapper.instance()._isRowLoaded({index: 4})).to.be.true;
	});
	
	it("Tests _loadMoreRows to make sure loadMoreData is called with the right indices", () => {
		wrapper.instance()._loadMoreRows({startIndex: 5, stopIndex: 6});
		expect(wrapper.instance().props.loadMoreData.calledOnce).to.be.true;
		expect(wrapper.instance().props.loadMoreData.getCall(0).args).to.deep.equal([5, 10]);
	});
	
	it("Tests _rowRenderer with a loaded item", () => {
		sandbox.stub(wrapper.instance(), "_isRowLoaded").returns(true);
		wrapper.setProps({
			loadedImages: [{}, {url: "testUrl"}]
		});
		wrapper.instance().render();
		const res = wrapper.instance()._rowRenderer({index: 1, key: 1, style: {}});
		expect(res.props.children.props.children.props.children.props.src).to.be.equal("testUrl");
	});
	
	it("Tests _rowRenderer with an unloaded item", () => {
		sandbox.stub(wrapper.instance(), "_isRowLoaded").returns(false);
		wrapper.setProps({
			loadedImages: [{url: "testUrl"}]
		});
		wrapper.instance().render();
		const res = wrapper.instance()._rowRenderer({index: 1, key: 1, style: {}});
		expect(res.props.children.type).to.be.equal(LoaderComponent);
	});
	
	it("Tests renderSelectedImage with a loaded item", () => {
		wrapper.setProps({
			loadedImages: [{}, {url: "testUrl"}]
		});
		wrapper.setState({
			currentImageIndex: 1
		});
		const res = wrapper.instance().renderSelectedImage();
		expect(res.props.children.props.src).to.be.equal("testUrl");
	});
	
	it("Tests renderSelectedImage with an unloaded item", () => {
		wrapper.setState({
			currentImageIndex: 1
		});
		const res = wrapper.instance().renderSelectedImage();
		expect(res.props.children.type).to.be.equal(LoaderComponent);
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});