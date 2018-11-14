import { Selector } from 'testcafe';

export default class StatisticsPage {
    constructor() {
		this.stats = Selector("div[data-summary-stats]");
		this.contributions = Selector("div[data-summary-contributions]");
		
		this.contributionCards = this.stats.find("*[data-contributions-value]");
		this.ratingsCard = this.contributionCards.nth(0);
		this.commentsCard = this.contributionCards.nth(1);
		this.imagesCard = this.contributionCards.nth(2);
		this.totalContributionsCard = this.contributionCards.nth(3);
    }
}
