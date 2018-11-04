import { Selector } from 'testcafe';

/**
 * This class provides actions for working with an infinite image gallery
 */
export default class ImageGallery {
	
    constructor() {
		this.rows = Selector(".infiniteImageListRow");
		this.selectedImage = Selector(".selectedImageWrapper");
		this.closeButton = Selector(".closeButton");
    }
	
	/**
	 * Gets the number of loaded images
	 * @return {number} - the number of loaded images
	 */
	getRowCount() {
		return this.rows.count;
	}
	
	/**
	 * Gets the index of the selected image
	 * @param {Object} t - the testcafe runner
	 * @return {number} - the index of the selected image
	 */
	async getSelectedRowIndex(t) {
		return await t.eval(() => {
			const allImages = Array.prototype.slice.apply(document.querySelectorAll(".infiniteImageListRow")),
				selected = document.querySelector(".infiniteImageRowSelected");
			return allImages.indexOf(selected.parentElement);
		});
	}
}

