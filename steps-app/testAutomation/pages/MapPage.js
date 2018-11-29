import { Selector, ClientFunction } from 'testcafe';

export default class MapPage {
    constructor () {
        this.map = Selector('div.esri-view-root > div.esri-view-surface.esri-view-surface--inset-outline', {timeout: 20000});
		this.zoomInButton = Selector("div[title='Zoom In']");
		this.zoomOutButton = Selector("div[title='Zoom Out']");
		this.base = Selector(".esri-view-user-storage", {timeout: 30000});
		
		this.expandFilterButton = Selector("#filterGUIMinimized .btn", {timeout: 20000});
		this.filterModal = Selector("#filterGUI", {timeout: 20000});
		this.closeFilters = Selector(".closeFilters");
		this.applyFiltersButton = Selector(".applyButton");
		this.addFilterButton = Selector(".addFilter");
		this.tableCell = Selector(".filterTable tbody th");
		this.deleteFilterButton = this.tableCell.find("svg");
		this.traitSelect = Selector("#selectTrait");
		this.operatorSelect = Selector("#selectOperator");
		this.valueSelect = Selector("#selectValue");
		this.accessibilityTraitOption = this.traitSelect.find("option[value='Accessibility']");
		this.clearFiltersButton = Selector(".btn-group.floatRight button").nth(0);
    }
	
	/**
	 * Gets the current zoom level of the map
	 * @return {number} - the zoom level of the map
	 */
	async getZoomLevel() {
		return await ClientFunction(() => DEV_MAP_STORE.state.view.zoom)();
	}
	
	/**
	 * Gets the position of the current center of the map
	 * @return {Object} - the center position of the map
	 */
	async getMapCenter() {
		return await ClientFunction(() => {
			return {
				x: DEV_MAP_STORE.state.view.center.x,
				y: DEV_MAP_STORE.state.view.center.y
			};
		})();
	}
	
	/**
	 * Waits for the map to load
	 * @param {Object} t - the testcafe runner
	 */
	async waitForLoad(t) {
		await t.expect(this.base.exists).eql(true, {timeout: 30000}).wait(5000);
	}
	
	/**
	 * Loads the default sidewalk used for testing
	 * @param {Object} t - the testcafe runner
	 */
	async loadDefaultSidewalk(t) {
		await t.eval(() => {
			DEV_SIDEWALK_STORE.onLoadSidewalkDetails({
				id: 2,
				overallRating: 5,
				accessibility: 3,
				comfort: 2,
				connectivity: 4,
				physicalSafety: 3,
				senseOfSecurity: 5
			});
			DEV_MAP_STORE.setState({sidewalkSelected: true})
		});
	}

	async loadSidewalkMock(t) {
		await t.eval(() => {
			DEV_SIDEWALK_STORE.onLoadSidewalkDetails({
				id: 560828369,
				overallRating: 5,
				accessibility: 3,
				comfort: 2,
				connectivity: 4,
				physicalSafety: 3,
				senseOfSecurity: 5
			});
			DEV_MAP_STORE.setState({sidewalkSelected: true})
		});
	}

		async loadSidewalkMock2(t) {
			await t.eval(() => {
				DEV_SIDEWALK_STORE.onLoadSidewalkDetails({
					id: 560828397,
					overallRating: 5,
					accessibility: 3,
					comfort: 2,
					connectivity: 4,
					physicalSafety: 3,
					senseOfSecurity: 5
				});
				DEV_MAP_STORE.setState({sidewalkSelected: true})
			});
		}
}
