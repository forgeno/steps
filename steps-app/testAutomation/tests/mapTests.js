import config from "../config";
import MapPage from "../pages/MapPage";
import SidewalkDrawer from "../pages/SidewalkDrawer";

// Page model
const mapPage = new MapPage();
const drawer = new SidewalkDrawer();

fixture `Tests the map dashboard page`
    .page `${config.baseUrl}`
	.beforeEach(async (t) => {
		await t.wait(5000);
	});

// Tests
test("opening the drawer when clicking on a sidewalk", async (t) => {
    await t.click(mapPage.map, {offsetX: 375, offsetY: 349})
        .expect(drawer.drawer.visible).eql(true, {timeout: 30000})
		.expect(drawer.addressName.textContent).eql("test2");
});

// TODO: uncomment this when this is implemented
/*test("not opening the drawer when a non-sidewalk point is clicked", async (t) => {
	await t.click(mapPage.map, {offsetX: 386, offsetY: 173})
		.wait(3000)
        .expect(drawer.drawer.exists).eql(false)
});*/

test("zooming with the zoom buttons", async (t) => {
	const startingZoom = await mapPage.getZoomLevel();
	await t.click(mapPage.zoomInButton)
		.wait(2000);
		
	await t.expect(await mapPage.getZoomLevel()).gt(startingZoom)
		.click(mapPage.zoomOutButton)
		.click(mapPage.zoomOutButton)
		.wait(3000);
	
	await t.expect(await mapPage.getZoomLevel()).lt(startingZoom);
});

test("dragging the map", async (t) => {
	const startingCenter = await mapPage.getMapCenter();
	// drag left
	await t.drag(mapPage.map, 360, 0)
		.wait(2000);
	
	const leftCenter = await mapPage.getMapCenter();
	await t.expect(leftCenter.x).lt(startingCenter.x);
	
	// drag right
	await t.drag(mapPage.map, -360, 0)
		.wait(2000);
	
	const rightCenter = await mapPage.getMapCenter();
	await t.expect(rightCenter.x).gt(leftCenter.x);
});
