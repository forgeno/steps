import { RequestLogger, RequestMock, Selector } from 'testcafe';

import config from "../config";
import MapPage from "../pages/MapPage";
import SidewalkDrawer from "../pages/SidewalkDrawer";

// Page model
const mapPage = new MapPage();
const drawer = new SidewalkDrawer();

const logger = RequestLogger({
    logResponseHeaders: true,
    logResponseBody: true,
	logRequestBody: true,
	stringifyRequestBody: true
});

fixture `Tests the map dashboard page`
    .page `${config.baseUrl}`
	.beforeEach(async (t) => {
		await mapPage.waitForLoad(t);
	});

// Tests



test("Interacting with filterUI", async (t) => {
	const clearButton = Selector('button').withText('Clear')
	const applyFilter = Selector('button').withText('Apply Filter')
	const filterTable = Selector("#filterTable")
	const addFilter = Selector(".AddFilter")

	let filterTableRowNum = filterTable.find("tr")
	let oldRows = await filterTableRowNum.count
	
	await t.click(addFilter)

	let newrowNum = await filterTableRowNum.count
	await t.expect((oldRows+1)).eql(newrowNum,"Filter is not being added correctly")
	console.log(oldRows,newrowNum)
	await t.click(applyFilter)

	await t.click(Selector('#rateTrait'))
	await t.click(Selector('option').withText('AvgSecurity'))
	await t.click(Selector('#equalitySelector'))
	await t.click(Selector('option').withText('>'))
	await t.click(Selector('#numberSelector'))
	await t.click(Selector('option').withText('1'))
	await t.click(addFilter)
	newrowNum = await filterTableRowNum.count
	console.log(oldRows,newrowNum)
	await t.expect((oldRows+2)).eql(newrowNum,"Filter is not being added correctly")
	await t.click(applyFilter)
	await t.click(clearButton)
	newrowNum = await filterTableRowNum.count
	await t.expect((newrowNum)).eql(1,"Filter is not being cleared correctly")
});

test("opening the drawer when clicking on a sidewalk", async (t) => {
	await mapPage.loadDefaultSidewalk(t);
    await t.expect(drawer.drawer.visible).eql(true, {timeout: 30000})
		.expect(drawer.addressName.textContent).eql("test2");
});

test("not opening the drawer when a non-sidewalk point is clicked", async (t) => {
	await t.click(mapPage.map, {offsetX: 386, offsetY: 173})
		.wait(3000)
        .expect(drawer.drawer.exists).eql(false)
});

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

