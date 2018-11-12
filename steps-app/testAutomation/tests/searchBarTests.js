import {Selector} from "testcafe";

import config from "../config";
import Header from "../pages/Header";

const header = new Header();

fixture `Tests the search bar`
    .page `${config.baseUrl}`;

test("that the search bar is visible on the map dashboard", async (t) => {
    await t.expect(header.searchBar.visible).eql(true);
});

test("that the search bar is not visible on other pages", async (t) => {
	await t.click(header.buttons.nth(2))
		.expect(header.searchBar.exists).eql(false);
});
