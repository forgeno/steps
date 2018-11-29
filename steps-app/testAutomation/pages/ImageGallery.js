import { Selector } from 'testcafe';

/**
 * This class provides actions for working with an infinite image gallery
 */
export default class ImageGallery {
	
    constructor() {
		this.rows = Selector(".image-gallery-thumbnail")
		this.selectedImage = Selector(".selectedImageWrapper");
		this.closeButton = Selector(".imageDeleteAvatar");
		this.imageDeleteButton = Selector(".imageDeleteAvatar");
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
			const allImages = Array.prototype.slice.apply(document.querySelectorAll(".image-gallery-thumbnail")),
				selected = document.querySelector(".image-gallery-thumbnail.active");
			return allImages.indexOf(selected);
		});
	}
}

