import sinon from "sinon";
import {expect} from "chai";

import MapStore from "../../../map/MapStore";

const SIDEWALK_ID = 1;

describe("Tests the MapStore", function() {
	
	const store = new MapStore();
	let sandbox = null;
	
	beforeEach(() => {
		store.setState({
			selectedSidewalkDetails: {
				id: SIDEWALK_ID
			},
			sidewalks: []
		});
		sandbox = sinon.createSandbox();
	});
	
	it("Tests onUpdateSidewalkRatings with a found sidewalk", () => {
		const sidewalkDetails = {
			accessibility: 3,
			overallRating: 3,
			comfort: 3,
			connectivity: 3,
			physicalSafety: 3,
			senseOfSecurity: 3,
			id: SIDEWALK_ID
		};
		const updatedSidewalks = [{
			id: SIDEWALK_ID
		}];
		store.setState({
			sidewalks: updatedSidewalks
		});
		store.onUpdateSidewalkRatings(sidewalkDetails);
		expect(store.state.sidewalks[0]).to.deep.equal(sidewalkDetails);
	});
	
	it("Tests onUpdateSidewalkRatings with an unfound sidewalk", () => {
		const sidewalkDetails = {
			accessibility: 3,
			overallRating: 3,
			comfort: 3,
			connectivity: 3,
			physicalSafety: 3,
			senseOfSecurity: 3,
			id: SIDEWALK_ID
		};
		store.onUpdateSidewalkRatings(sidewalkDetails);
		expect(store.state.selectedSidewalkDetails).to.deep.equal({id: SIDEWALK_ID});
	});
	
	afterEach(() => {
		sandbox.restore();
	});
});