import React from "react";
import { Component } from "reflux";
import md5 from "md5";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import AdminActions from "./AdminActions";
import Store from "./AdminStore";

import SuccessAlertComponent from "../misc-components/SuccessAlertComponent";
import ErrorAlertComponent from "../misc-components/ErrorAlertComponent";
import SpamUtil from "../util/SpamUtil";
import {LOCAL_STORAGE_NAME, SUSPENSION_COOKIE, COOKIE_EXPIRE_TIME, MAX_LOGIN_ATTEMPTS} from "../constants/AdminConstants";

/**
 * This component renders the page for admin Login
 */
export default class AdminLogin extends Component {

    constructor(props) {
        super(props);
        this.store = Store;
		this.state = {
            enteredName: "",
			enteredPassword: ""
        };
	}
	
	componentWillUpdate() {
		if (this.state.isLoggedIn) {
			this.props.history.push('/dashboard');
        }
	}
	
    /**
	 * Handles the user changing their username text value
	 */
	_handleUserChange = (e) => {
		this.setState({ 
            enteredName: e.target.value,
		});
    }
    
    /**
	 * Handles the user changing their password text value
	 */
    _handlePassChange = (e) => {
		this.setState({ 
            enteredPassword: e.target.value
		});
	}

	_validateCredentials = () => {
		if (this.state.enteredName.length > 0 && this.state.enteredPassword.length > 0) {
			return !Boolean(SpamUtil.getCookie(SUSPENSION_COOKIE));
		}
		return false;
    }

	/**
	 * Checks if the credentials entered by the user are correct
	 * If not enter correct credential first time storage is implemented
	 * If user enters Credentials incorrectly 4 times then they are suspended. Cookie is created during this time.
	 */
	_handleSubmit = () => {
		const attempts = Number(SpamUtil.getLocalStorage(LOCAL_STORAGE_NAME));
		if (isNaN(attempts) || attempts < MAX_LOGIN_ATTEMPTS + 1) {
			AdminActions.checkCredentials(this.state.enteredName, md5(this.state.enteredPassword));
		} else {
			SpamUtil.setCookie(SUSPENSION_COOKIE, "true", COOKIE_EXPIRE_TIME, "login");
			SpamUtil.deleteLocalStorage(LOCAL_STORAGE_NAME)
		}

		this.setState({
            enteredName: "",
            enteredPassword: ""
		});
	}

    /**
	 * Handles the component being closed
	 */
	_handleClose = () => {
        AdminActions.dismissLoginSuccess();
        AdminActions.dismissLoginError();
	};

    render(){
        return (
			<div className="LoginCSS">
            <div className="loginContainer" data-admin-login={true}>
				<Card>
					<CardContent>
						<h3 className="adminTitleLogin">Admin Login</h3>
						<FormGroup 
							controlId="username" 
							bsSize="small">
							<ControlLabel>Username</ControlLabel>
							<FormControl 
								autoFocus type="username" 
								value={this.state.enteredName}
								onChange={this._handleUserChange}
								placeholder="Username"/>
						</FormGroup>
						
						<FormGroup 
							controlId="password" 
							bsSize="small">
							<ControlLabel>Password</ControlLabel>
							<FormControl 
								value={this.state.enteredPassword} 
								onChange={this._handlePassChange}
								type="password"
								placeholder="Password"/>
						</FormGroup> 
						
						<Button bsStyle="primary" type="submit" onClick = {this._handleSubmit} disabled={!this._validateCredentials()}>Login</Button>
					</CardContent>
				</Card>
                
                <SuccessAlertComponent onClose={this._handleClose}
								 visible={this.state.successfullyLoggedIn}
								 message="You have successfully been logged in."/>
                <ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.failedToLogIn}
								 message="You have entered an incorrect username or password."/>
				<ErrorAlertComponent onClose={() => {}}
								 visible={SpamUtil.getCookie("Suspended")}
								 hideClose
								 message="You have tried to log in unsuccessfully too many times. Try again in a minute."/>
            </div>
			</div>
        )
    }
}