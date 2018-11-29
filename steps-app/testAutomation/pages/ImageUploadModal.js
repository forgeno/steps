import { Selector } from 'testcafe';

import BaseModal from "./BaseModal";

/**
 * This class represents the modal used to upload images to a sidewalk
 */
export default class ImageUploadModal extends BaseModal {
	
    constructor() {
		super();
		this.selectImageButton = Selector(".rowImgSelector > .btn");
		this.selectImageInput = this.selectImageButton.find("input");
    }
	
}

