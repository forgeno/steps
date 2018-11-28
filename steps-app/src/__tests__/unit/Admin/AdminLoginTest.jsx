import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import AdminLoginComponent from "../../../admin/AdminLogin";
import AdminActions from "../../../admin/AdminActions";
import SpamUtil from "../../../util/SpamUtil";

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

    it("should return false if cookie suspended is true", () => {
        const wrapper = shallow(<AdminLoginComponent/>);
        wrapper.setState({
            enteredName: "aaa",
            enteredPassword: "bbb"
        });
    
        sandbox.stub(SpamUtil, "getCookie").returns(true);
        expect(wrapper.instance()._validateCredentials()).to.be.false;

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

    it("Should check if credentials function is being called from handle Submit.", () => {
        const adminLogin = sandbox.stub(AdminActions, "checkCredentials"),
        wrapper = shallow(<AdminLoginComponent/>);

        sandbox.stub(wrapper.instance(), "_displayAttempts");

        wrapper.setState({
            enteredName: "hello",
            enteredPassword: "pass"
        });

        sandbox.stub(SpamUtil, "getLocalStorage").returns(1);

        wrapper.instance()._handleSubmit();
		expect(adminLogin.calledOnce).to.be.true
    });

    it("Should check if multiple Login attempts is porhibited and appropriate cookie is set", () => {
        const cookie = sandbox.stub(SpamUtil, "setCookie"),
        wrapper = shallow(<AdminLoginComponent/>);

        sandbox.stub(wrapper.instance(), "_displayAttempts");

        wrapper.setState({
            enteredName: "hello",
            enteredPassword: "pass"
        });

        sandbox.stub(SpamUtil, "getLocalStorage").returns(7);
        wrapper.instance()._handleSubmit();
        expect(cookie.calledOnce).to.be.true;
    });
    
    afterEach(() => {
        sandbox.restore();
    });
});