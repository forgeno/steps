import config from "../config";
import StatisticsPage from "../pages/StatisticsPage";

const statisticsPage = new StatisticsPage();

fixture `Tests the summary statistics page`
    .page `${config.baseUrl}/statistics`;

test("viewing the contributions page", async (t) => {
	await t.expect(statisticsPage.contributions.visible).eql(true)
		.expect(parseInt(statisticsPage.totalContributionsCard.textContent))
		.eql(parseInt(statisticsPage.ratingsCard.textContent) + parseInt(statisticsPage.commentsCard.textContent)
			+ parseInt(statisticsPage.imagesCard.textContent));
});

test("viewing the sidewalks page", async (t) => {
	await t.click(statisticsPage.sidewalksTab)
		.expect(statisticsPage.sidewalks.visible).eql(true)
		.expect(statisticsPage.contributions.exists).eql(false);
	
	const ratingText = await statisticsPage.firstOverallRatingCell.textContent;
	await t.click(statisticsPage.numericRatingButton)
		.expect(statisticsPage.firstOverallRatingCell.textContent).notEql(ratingText)
		.click(statisticsPage.textRatingButton)
		.expect(statisticsPage.firstOverallRatingCell.textContent).eql(ratingText);
});

test("selecting the contributions tab from the sidewalks tab", async (t) => {
	await t.click(statisticsPage.sidewalksTab)
		.click(statisticsPage.contributionsTab)
		.expect(statisticsPage.sidewalks.exists).eql(false)
		.expect(statisticsPage.contributions.visible).eql(true);
});