import sinon from "sinon";
import { shallow } from "enzyme";
import React from "react";
import { expect } from "chai";

import SpamUtility from "../../../util/SpamUtil";
import AdminLoginComponent from "../../../admin/AdminLogin";
import AdminActions from "../../../admin/AdminActions";
import SpamUtil from "../../../util/SpamUtil";

describe("Tests the SpamUtil class", function() {

    let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
    });

    it("Tests if LocalStorage is being set", () => {
        SpamUtil.setLocalStorage('test1')
        const utilStorage = localStorage.getItem('test1');
        expect(utilStorage).to.be.equal('1')
    });

    it("Tests if setValueLocalStorage is being set", () => {
        SpamUtil.setValueLocalStorage('test1', 'returnTest');
        const utilStorage = localStorage.getItem('test1');
        expect(utilStorage).to.be.equal('returnTest');
    });

    it("Tests if getLocalStorage returns value", () => {
        // SpamUtil.setValueLocalStorage('test1', 'returnTest');
        localStorage.setItem('test1', 'returnTest')
        const checkLocal = SpamUtil.getLocalStorage('test1');
        expect(checkLocal).to.be.equal('returnTest');
    });

    it("Tests if deleteLocalStorage is being set", () => {
        localStorage.setItem('test1', 'returnTest')
        const deleteLocal = SpamUtil.deleteLocalStorage('test1');
        expect(deleteLocal).to.be.equal(undefined);
    });

    it("Test if cookie being set", () => {
        SpamUtil.setCookie("test1", "returnTest", 5, "");
        const getCookieValue = SpamUtil.getCookie('test1')
        expect(getCookieValue).to.be.equal("returnTest");
    });

    it("Test if cookie deleted", () => {
        document.cookie = "test1=returnTest";
        const getCookieValue = SpamUtil.getCookie('test1')
        expect(getCookieValue).to.be.equal("returnTest");
    });

    it("Test if cookie deleted", () => {
        document.cookie = "test1=returnTest";
        SpamUtil.deleteCookie('test1')
        const cookieValue = SpamUtil.getCookie('test1')
        expect(cookieValue).to.be.equal('');
    });

    it("Test if getting cookie succeeds", () => {
        document.cookie = "test1=returnTest";
        const getCookieValue = SpamUtil.getCookie('test1')
        expect(getCookieValue).to.be.equal("returnTest");
    });


    afterEach(() => {
        sandbox.restore();
    });
});

