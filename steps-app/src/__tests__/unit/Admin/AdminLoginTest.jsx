import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import sinon from "sinon";

import AdminLoginComponent from "../../../admin/AdminLogin";
import AdminActions from "../../../admin/AdminActions";
import AdminStore from "../../../admin/AdminStore";
import { wrap } from "sinon/lib/sinon/util/core/deprecated";

describe("<AdminLoginComponent>", function() {
    let sandbox = null;

    beforeEach( () => {
        sandbox = sinon.createSandbox();
    });

    it("should call the reflux action when the text is entered or changed in the input of username", () => {
        const wrapper = shallow(<AdminLoginComponent/>);
        const testObject = {
            target: {value: "test String"}
        };
        wrapper.instance()._handleUserChange(testObject);
        expect(wrapper.state("username")).to.equal("test String");
    });

    it("should call the reflux action when the text is entered or changed in the input of password", () => {
        const wrapper = shallow(<AdminLoginComponent/>);
        const testObject = {
            target: {value: "test String"}
        };
        wrapper.instance()._handlePassChange(testObject);
        expect(wrapper.state("password")).to.equal("test String");
    });

    it("should return success if credentials entered are correct",() => {
        const wrapper = shallow(<AdminLoginComponent/>);
        wrapper.setState({
            username: "stepsAdmin",
            password: "stepsSix"
        });

        const output = wrapper.instance()._validateCredentials();
        expect(output).to.equal("success");
    });

    it("should return error if incorrect credentials are entered", () => {
        const wrapper = shallow(<AdminLoginComponent/>);
        wrapper.setState({
            username: "",
            password: "hello"
        });

        const output = wrapper.instance()._validateCredentials();
        expect(output).to.equal("error");
    });

    it("should check if check credentials function is being called from handle submit.", () => {
        const adminLogin = sandbox.stub(AdminActions, "checkCredentials"),
		wrapper = shallow(<AdminLoginComponent/>);

		wrapper.setState({
            username: "hello",
            password: "pass"
		});

		wrapper.instance()._handleSubmit();
		expect(adminLogin.called).to.be.true
    });

    it("should direct to new page if valid credentials entered", () => {
        const history = [];
        const wrapper = shallow(<AdminLoginComponent history={history}/>);
        
        wrapper.setState({
            isLoggedIn: true
        });
        expect(history).to.deep.equal(["/dashboard"]);
    });
});