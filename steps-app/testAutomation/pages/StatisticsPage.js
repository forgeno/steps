import { Selector } from 'testcafe';

export default class StatisticsPage {
    constructor() {
		this.stats = Selector("div[data-summary-stats]");
		this.contributions = Selector("div[data-summary-contributions]");
		this.sidewalks = Selector("div[data-summary-sidewalks]");
		
		this.contributionsTab = Selector("div[data-summary-stats] span").nth(0);
		this.sidewalksTab = Selector("div[data-summary-stats] span").nth(4);
		
		this.contributionCards = this.stats.find("*[data-contributions-value]");
		this.ratingsCard = this.contributionCards.nth(0);
		this.commentsCard = this.contributionCards.nth(1);
		this.imagesCard = this.contributionCards.nth(2);
		this.totalContributionsCard = this.contributionCards.nth(3);
		
		this.firstOverallRatingCell = Selector("table > tbody > tr:nth-child(1) > td:nth-child(2) > div");
		this.textRatingButton = Selector("input[name='text-description']");
		this.numericRatingButton = Selector("input[name='numeric-description']");
    }
}
