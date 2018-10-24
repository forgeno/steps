import sinon from "sinon";
import SummaryMapStore from "../../../Map/SummaryMapStore";
import {expect} from "chai";

describe("Test the Summary Map components", () => {

    describe("handle esriLoader interactons properly", () => {

        it("should set the proper state when esriLoader resolves", () => {
            const map = sinon.stub(),
                View = sinon.stub(),

            mapStoreTest = new SummaryMapStore();
            mapStoreTest.onDisplayOSMBaseMap([map, View]);

            expect(mapStoreTest.state).to.deep.equal({map: new map(), view: new View()})
        });
    }); 
    
});

