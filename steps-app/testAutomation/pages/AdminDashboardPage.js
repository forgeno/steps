import { Selector } from 'testcafe';

export default class AdminDashboardPage {
	
    constructor() {
    this.page = Selector("div");
    this.rejectButton = Selector(".imageDeleteAvatar");
    this.acceptButton = Selector(".imageApproveAvatar");
    this.csvButton = Selector(".csvButton");
    this.recordedResponse = Selector(".successAlert")
    this.failedResponse = Selector(".errorAlert")
    this.carousel = Selector(".image-gallery");
    }
}
