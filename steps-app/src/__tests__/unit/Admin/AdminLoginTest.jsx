import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import AdminLoginComponent from "../../../admin/AdminLogin";
import AdminActions from "../../../admin/AdminActions";

describe("<AdminLoginComponent>", function() {
    let sandbox = null;

    beforeEach( () => {
        sandbox = sinon.createSandbox();
    });

    it("should update the username when the field is updated", () => {
        const wrapper = shallow(<AdminLoginComponent/>);
        const testObject = {
            target: {value: "test String"}
        };
        wrapper.instance()._handleUserChange(testObject);
        expect(wrapper.state("enteredName")).to.equal("test String");
    });

    it("should update the password when the field is updated", () => {
        const wrapper = shallow(<AdminLoginComponent/>);
        const testObject = {
            target: {value: "test String"}
        };
        wrapper.instance()._handlePassChange(testObject);
        expect(wrapper.state("enteredPassword")).to.equal("test String");
    });

    it("should return success if credentials are not blank",() => {
        const wrapper = shallow(<AdminLoginComponent/>);
        wrapper.setState({
            enteredName: "bbbb",
            enteredPassword: "aaaa"
        });

        expect(wrapper.instance()._validateCredentials()).to.be.true;
    });

    it("should return error if credentials are blank", () => {
        const wrapper = shallow(<AdminLoginComponent/>);
        wrapper.setState({
            enteredName: "",
            enteredPassword: "hello"
        });

        expect(wrapper.instance()._validateCredentials()).to.be.false;
    });

    it("should check if check credentials function is being called from handle submit.", () => {
        const adminLogin = sandbox.stub(AdminActions, "checkCredentials"),
		wrapper = shallow(<AdminLoginComponent/>);

		wrapper.setState({
            enteredName: "hello",
            enteredPassword: "pass"
		});

		wrapper.instance()._handleSubmit();
		expect(adminLogin.calledOnce).to.be.true
    });

    it("should direct to new page if valid credentials entered", () => {
        const history = [];
        const wrapper = shallow(<AdminLoginComponent history={history}/>);
        wrapper.setState({
            isLoggedIn: true
        });
		wrapper.instance().forceUpdate();
        expect(history).to.deep.equal(["/dashboard"]);
    });
});