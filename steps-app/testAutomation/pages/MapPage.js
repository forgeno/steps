import { Selector, ClientFunction } from 'testcafe';

export default class Page {
    constructor () {
        this.map = Selector('div.esri-view-root > div.esri-view-surface.esri-view-surface--inset-outline', {timeout: 20000});
		this.zoomInButton = Selector("div[title='Zoom In']");
		this.zoomOutButton = Selector("div[title='Zoom Out']");
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
}
