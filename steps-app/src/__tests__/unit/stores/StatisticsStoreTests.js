import sinon from "sinon";
import {expect} from "chai";

import SummaryStatisticsStore from "../../../summary/SummaryStatisticsStore";
import RestUtil from "../../../util/RestUtil";

describe("Tests the SummaryStatisticsStore", function() {
	
	const store = new SummaryStatisticsStore();
	let sandbox = null;
	
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	
	it("Tests onLoadSummaryStatistics sorting contributions with same month, different years", () => {
		sandbox.stub(RestUtil, "sendGetRequest").returns({
			then: (callback) => {
				callback({
					contributionsByMonth: [{
						monthYear: "5/2009",
						contributions: 255
					}, {
						monthYear: "5/2012",
						contributions: 999
					}, {
						monthYear: "5/2011",
						contributions: 250
					}]
				});
				return {
					catch: () => {}
				}
			}
		});
		store.onLoadSummaryStatistics();
		expect(store.state.contributionsByMonth).to.deep.equal([{
						monthYear: "5/2009",
						contributions: 255
					}, {
						monthYear: "5/2011",
						contributions: 250
					}, {
						monthYear: "5/2012",
						contributions: 999
					}]);
	});
	
	it("Tests onLoadSummaryStatistics sorting contributions with different months, same years", () => {
		sandbox.stub(RestUtil, "sendGetRequest").returns({
			then: (callback) => {
				callback({
					contributionsByMonth: [{
						monthYear: "4/2012",
						contributions: 2555
					}, {
						monthYear: "5/2012",
						contributions: 999
					}, {
						monthYear: "3/2012",
						contributions: 250
					}]
				});
				return {
					catch: () => {}
				}
			}
		});
		store.onLoadSummaryStatistics();
		expect(store.state.contributionsByMonth).to.deep.equal([{
						monthYear: "3/2012",
						contributions: 250
					}, {
						monthYear: "4/2012",
						contributions: 2555
					}, {
						monthYear: "5/2012",
						contributions: 999
					}]);
	});
	
	it("Tests onLoadSummaryStatistics sorting contributions with different months, different years", () => {
		sandbox.stub(RestUtil, "sendGetRequest").returns({
			then: (callback) => {
				callback({
					contributionsByMonth: [{
						monthYear: "4/2012",
						contributions: 2555
					}, {
						monthYear: "5/2010",
						contributions: 999
					}, {
						monthYear: "3/2008",
						contributions: 250
					}, {
						monthYear: "12/2008",
						contributions: 1500
					}]
				});
				return {
					catch: () => {}
				}
			}
		});
		store.onLoadSummaryStatistics();
		expect(store.state.contributionsByMonth).to.deep.equal([{
						monthYear: "3/2008",
						contributions: 250
					}, {
						monthYear: "12/2008",
						contributions: 1500
					}, {
						monthYear: "5/2010",
						contributions: 999
					}, {
						monthYear: "4/2012",
						contributions: 2555
					}]);
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});