import { Selector } from 'testcafe';

/**
 * This class represents the modal used to submit a rating to a sidewalk
 */
export default class RatingsModal {
	
    constructor() {
		this.slider = Selector(".ratingSlider > div", {timeout: 15000});
		this.sliderText = Selector(".ratingSlider span", {timeout: 15000});
		
		// sliders
		this.accessibilitySlider = this.slider.nth(0);
		this.connectivitySlider = this.slider.nth(1);
		this.comfortSlider = this.slider.nth(2);
		this.physicalSafetySlider = this.slider.nth(3);
		this.senseOfSecuritySlider = this.slider.nth(4);
		
		// rating text
		this.accessibilityText = this.sliderText.nth(0);
		this.connectivityText = this.sliderText.nth(1);
		this.comfortText = this.sliderText.nth(2);
		this.physicalSafetyText = this.sliderText.nth(3);
		this.senseOfSecurityText = this.sliderText.nth(4);
		
		// buttons
		this.confirm = Selector(".modal-title").parent().child(2).find("button").nth(1);
		this.cancel = Selector(".modal-title").parent().child(2).find("button").nth(0);
    }
	
}

