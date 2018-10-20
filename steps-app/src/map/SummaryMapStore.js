import Reflux from "reflux";
import Actions from "./LoadMapActions";

export default class SummaryMapStore extends Reflux.Store {

    constructor() {
        super();
        this.state = {};
		this.listenables = Actions;
	}


}
