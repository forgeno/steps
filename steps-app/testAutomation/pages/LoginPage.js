import { Selector } from 'testcafe';

export default class LoginPage {
    constructor() {
		this.title = Selector(".adminTitleLogin");
		this.username = Selector("*[data-admin-login] #username");
		this.password = Selector("*[data-admin-login] #password");
		this.submit = Selector("*[data-admin-login] .btn");
    }
}
