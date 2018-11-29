import config from "../config";
import StatisticsPage from "../pages/StatisticsPage";
import AdminUtilities from "../util/AdminUtilities";

const statisticsPage = new StatisticsPage();

fixture `Tests the summary statistics page`
    .page `${config.baseUrl}/statistics`;

test("viewing the contributions page", async (t) => {
	await t.expect(statisticsPage.contributions.visible).eql(true)
		.expect(parseInt(statisticsPage.totalContributionsCard.textContent))
		.eql(parseInt(statisticsPage.ratingsCard.textContent) + parseInt(statisticsPage.commentsCard.textContent)
			+ parseInt(statisticsPage.imagesCard.textContent));
});

test("navigating with the tabs", async (t) => {
	await t.expect(statisticsPage.sidewalkSummary.exists).eql(false)
		.click(statisticsPage.sidewalkTab)
		.expect(statisticsPage.sidewalkSummary.visible).eql(true)
		.expect(statisticsPage.contributions.exists).eql(false)
		.click(statisticsPage.contributionsTab)
		.expect(statisticsPage.contributions.visible).eql(true);
});

test("interacting with the text format buttons on the sidewalks tab", async (t) => {
	await t.click(statisticsPage.sidewalkTab);
	
	const ratingText = await statisticsPage.accessibilityCell.textContent;
	await t.click(statisticsPage.numericRatingButton)
		.expect(statisticsPage.accessibilityCell.textContent).notEql(ratingText)
		.wait(500)
		.click(statisticsPage.textRatingButton)
		.expect(statisticsPage.accessibilityCell.textContent).eql(ratingText)
		.wait(500)
		.expect(isNaN(await statisticsPage.accessibilityCell.textContent)).eql(true);
});

test("the visibility of the export CSV button", async (t) => {
	await t.click(statisticsPage.sidewalkTab)
		.expect(statisticsPage.exportCSVButton.exists).eql(false);
	await AdminUtilities.silentLogin(t);
	await t.expect(statisticsPage.exportCSVButton.visible).eql(true);
});