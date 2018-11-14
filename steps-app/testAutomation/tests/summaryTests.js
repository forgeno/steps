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
