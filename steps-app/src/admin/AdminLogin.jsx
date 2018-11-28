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
import RestUtil from "../util/RestUtil";

/**
 * This component renders the page for admin Login
 */
export default class AdminLogin extends Component {

    constructor(props) {
        super(props);
        this.store = Store;
		this.state = {
            enteredName: "",
			enteredPassword: "",
			cookieExpireTime: 1,
			nameOfStorage: 'LoginAttempts',
			cookieName: 'Suspended'
        };
	}
	
	componentWillUpdate() {
		if (this.state.isLoggedIn){
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
		if(this.state.enteredName.length > 0 && this.state.enteredPassword.length > 0){
			if(SpamUtil.getCookie(this.state.cookieName)){
				return false
			}
			else{
				return true
			}
		}
		else {
			return false
		}
    }

	/**
	 * Checks if the credentials entered by the user are correct
	 * If not enter correct credential first time storage is implemented
	 * If user enters Credentials incorrectly 4 times then they are suspended. Cookie is created during this time.
	 */
	_handleSubmit = () => {
		if(SpamUtil.getCookie(this.state.cookieName)!= true){
			SpamUtil.setLocalStorage(this.state.nameOfStorage)
		}

		this._displayAttempts();
		
		if(Number(SpamUtil.getLocalStorage(this.state.nameOfStorage)) < 4){
			AdminActions.checkCredentials(this.state.enteredName, md5(this.state.enteredPassword));
		}
		else {
			SpamUtil.setCookie(this.state.cookieName, "true", this.state.cookieExpireTime, "login");
			SpamUtil.deleteLocalStorage(this.state.nameOfStorage)
		}

		this.setState({
            enteredName: "",
            enteredPassword: ""
		});
	}

	/**
	 * Displaying the number of attempts user has left before being suspended
	 */
	_displayAttempts = () => {
		let AttemptsLeft = 4 - Number(SpamUtil.getLocalStorage(this.state.nameOfStorage));
		if(AttemptsLeft > 0){
			document.getElementById("res").innerHTML = "You have " + AttemptsLeft + " Login Attempts."
		}
		else {
			document.getElementById("res").innerHTML = ""
		}
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
						<div id = "res"></div>
						<form>
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
						</form>
					</CardContent>
				</Card>
                
                <SuccessAlertComponent onClose={this._handleClose}
								 visible={this.state.successfullyLoggedIn}
								 message="You have successfully been logged in."/>
                <ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.failedToLogIn}
								 message="You have entered an incorrect username or password."/>
				<ErrorAlertComponent onClose={this._handleClose}
								 visible={SpamUtil.getCookie("Suspended")}
								 message="You cannot Login for 1 minute."/>
            </div>
			</div>
        )
    }
}