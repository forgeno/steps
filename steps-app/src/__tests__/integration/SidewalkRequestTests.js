import React from "react";
import ReactDOM from 'react-dom';
import { expect } from "chai";
import sinon from "sinon";

import MapDashboard from "../../map/MapDashboard";
import RestUtil from "../../util/RestUtil";
import PromiseUtilities from "../../../testUtil/PromiseUtilities";
import MapStore from "../../map/MapStore";
import SidewalkStore from "../../sidewalk/SidewalkStore";
import SidewalkActions from "../../sidewalk/SidewalkActions";

describe("Tests fetching and posting sidewalk data from the database", function() {
	
	let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
		sandbox.spy(RestUtil, "sendPostRequest");
		sandbox.spy(RestUtil, "sendGetRequest");
	});
	
	it("Tests fetching the list of all sidewalks when the map dashboard is loaded", async () => {
		const div = document.createElement("div");
		ReactDOM.render(<MapDashboard />, div);
		
		await PromiseUtilities.waitUntil(() => RestUtil.sendGetRequest.calledOnce);
		await PromiseUtilities.waitUntil(() => MapStore.state.sidewalks.length > 0);
		
		const response = MapStore.state.sidewalks;
		expect(response.length > 20).to.be.true;
		response.forEach((sidewalk) => {
			expect(sidewalk.id).to.exist;
			expect(typeof sidewalk.overallRating).to.be.equal("number");
			expect(typeof sidewalk.accessibility).to.be.equal("number");
			expect(typeof sidewalk.comfort).to.be.equal("number");
			expect(typeof sidewalk.connectivity).to.be.equal("number");
			expect(typeof sidewalk.physicalSafety).to.be.equal("number");
			expect(typeof sidewalk.senseOfSecurity).to.be.equal("number");
		});
	});
	
	it("Tests fetching data about a specific sidewalk once it is selected", async () => {
		SidewalkActions.loadSidewalkDetails({
			id: 2
		});
		await PromiseUtilities.waitUntil(() => SidewalkStore.state.currentSidewalk);
		
		const sidewalk = SidewalkStore.state.currentSidewalk;
		expect(sidewalk.id).to.be.equal(2);
		expect(typeof sidewalk.address).to.be.equal("string");
		expect(Array.isArray(sidewalk.mobilityTypeDistribution)).to.be.true;
		expect(typeof sidewalk.averageVelocity).to.be.equal("number");
		expect(typeof sidewalk.totalRatings).to.be.equal("number");
		expect(typeof sidewalk.totalComments).to.be.equal("number");
		expect(typeof sidewalk.totalImages).to.be.equal("number");
		expect(sidewalk.lastImage === null || typeof sidewalk.lastImage === "string").to.be.true;
		expect(Array.isArray(sidewalk.comments)).to.be.true;
	});
	
	// TODO
	/*it("Tests successfully posting details about a user created comment to the database", async () => {
		
		const comment = await RestUtil.sendPostRequest.promisedCall(0);
		
	});
	
	it("Tests unsuccessfully posting details about a user created comment to the database", async () => {
		
		const comment = await RestUtil.sendPostRequest.promisedCall(0);
		
	});*/
	
	afterEach(() => {
		sandbox.restore();
	});
});