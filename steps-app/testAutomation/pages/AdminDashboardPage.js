import { Selector } from 'testcafe';

export default class AdminDashboardPage {
	
    constructor() {
    this.page = Selector("div");
    this.previewContainer = Selector(".adminPreviewContainer");
    this.itemActive = Selector(".active");
    this.leftCarouselArrow = Selector(".left");
    this.rightCarouselArrow = Selector(".right");
    this.leftCarouselArrowDisabled = Selector(".disableLeftCarouselArrow");
    this.rightCarouselArrowDisabled = Selector(".disableRightCarouselArrow");
    this.previewRightArrow = Selector(".arrowRight");
    this.previewLeftArrow = Selector(".arrowLeft");
    this.rejectButton = Selector(".adminReject");
    }
}
