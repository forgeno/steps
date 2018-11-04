import { Selector } from 'testcafe';

export default class StatisticsPage {
    constructor() {
		this.stats = Selector("div[data-summary-stats]");
    }
}
