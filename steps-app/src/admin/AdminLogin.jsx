// import Reflux from "reflux";
import React from "react";
import { Component } from "reflux";
import md5 from "md5";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
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
        this._validCredentialAdminPage = this._validCredentialAdminPage.bind(this)
		this.state = {
            username: "",
            password: ""
          };
       
    }
    
    /**
	 * Handles the user changing their email text value
	 */
	_handleUserChange = (e) => {
		this.setState({ 
            username: e.target.value,
		});
    }
    
    /**
	 * Handles the user changing their email text value
	 */
    _handlePassChange = (e) => {
		this.setState({ 
            password: e.target.value
		});
	}

    _validateCredentials = (e) => {  
        const userLength = this.state.username.length
        const passLength = this.state.password.length
        if (userLength === 0 || passLength === 0){
            return "error"
        }
        else{
            return "success"
        }
    }

    _handleSubmit = (e) => {
        var md5 = require('md5');
        const hashpass = md5(String(this.state.password))       
        AdminActions.checkCredentials(String(this.state.username), hashpass);
		this.setState({
            username: "",
            password: ""
        });
    }
    /**
	 * Handles the component being closed
	 */
	_handleClose = () => {
        AdminActions.dismissLoginSuccess();
        AdminActions.dismissLoginError();
	};

    // _invalidCredentialError = (e) => {
    //     if(this.state.credentialError) {
    //        return (
    //         //    <p className = "credentialErrorDisplay">Entered credentials are Incorrect</p>
    //        )
    //     }
    // }

    _validCredentialAdminPage = (e) => {
        if(this.state.isLoggedIn){
            return(
                this.props.history.push('/About')
            )
        }
    }

    render(){
        return (
            <div className="loginContainer col-lg-4 col-md-6">
                <h3 className="adminTitleLogin">Admin Login</h3>
                <form>
                <FormGroup 
                    controlId="username" 
                    bsSize="small">
                <ControlLabel>Username</ControlLabel>
                
                <FormControl 
                    autoFocus type="username" 
                    value={this.state.username}
                    onChange={this._handleUserChange}
                    placeholder="Username"/>
                </FormGroup>
                
                <FormGroup 
                    controlId="password" 
                    bsSize="small">
                
                <ControlLabel>Password</ControlLabel>
                <FormControl 
                    value={this.state.password} 
                    onChange={this._handlePassChange}
                    type="password"
                    placeholder="Password"/>
                </FormGroup> 
                
                {/* {this._invalidCredentialError()} */}
                {this._validCredentialAdminPage()}
                <Button bsStyle="primary" type="submit" onClick = {this._handleSubmit} disabled={this._validateCredentials() === "error"}>Login</Button>
                </form>
                <SuccessAlertComponent onClose={this._handleClose}
								 visible={this.state.successfullyLoggedIn}
								 message="Successfully Loggedin."/>
                <ErrorAlertComponent onClose={this._handleClose}
								 visible={this.state.failedToLogIn}
								 message="Invalid Credentials"/>
            </div>
        )
    }
}