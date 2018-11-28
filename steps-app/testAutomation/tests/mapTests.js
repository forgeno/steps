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

test("Tests filter sidewalk GUI/Logic", async t => {
	const filterTable = Selector("#filterTable")
	const applyBtn = Selector(".AddFilter")
	
	const traitSelector =  Selector()
	const EqualitySelector =  Selector()
	const numberSelector =  Selector()

	const filterTableRowNum = filterTable.find("tr")
	const filterTableColNum = filterTable.find("td")
	let rowNum = await filterTableRowNum.count
	let colNum = await filterTableColNum.count
	let element = null;
	//const tableRowsCount = await filterTable[1].rowIndex;
	console.log(rowNum,colNum)
	await t.click(applyBtn);
	rowNum = await filterTableRowNum.count
	colNum = await filterTableColNum.count
	console.log(rowNum,colNum)
    await t
	for (let rows = 1; rows < rowNum; rows++) {
		for(let col = 0; col < colNum; col++){
	const filterTableRowNum = filterTable.find("tr")
			element = filterTableRowNum.nth(rows).length
			
			console.log(element)
		}
	}
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

