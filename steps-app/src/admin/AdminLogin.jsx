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

/**
 * This component renders the page for admin Login
 */
export default class AdminLogin extends Component {

    constructor() {
        super();
        this.store = Store;
		this.state = {
            enteredName: "",
            enteredPassword: ""
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

	/**
	 * Gets whether the submit button is enabled or not
	 * @return {boolean} - whether the submit button is enabled or not
	 */
    _validateCredentials = () => {
		return this.state.enteredName.length > 0 && this.state.enteredPassword.length > 0;
    }

    _handleSubmit = () => {
        AdminActions.checkCredentials(this.state.enteredName, md5(this.state.enteredPassword));
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
            <div className="loginContainer" data-admin-login={true}>
				<Card>
					<CardContent>
						<h3 className="adminTitleLogin">Admin Login</h3>
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
            </div>
        )
    }
}
