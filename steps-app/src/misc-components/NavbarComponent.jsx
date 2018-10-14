import React from "react";
import {Navbar, NavItem, Nav} from "react-bootstrap";

export default class NavbarComponent extends React.Component {

    render() {
        return (<Navbar>
            <Navbar.Header>
                <Navbar.Brand>
                    <a href="/">STEPS</a>
                </Navbar.Brand>
            </Navbar.Header>
            <Nav>
                <NavItem eventKey={1} href="/about">
                    About
                </NavItem>
                <NavItem eventKey={2} href="/statistics">
                    Statistics
                </NavItem>
                <NavItem eventKey={3} href="/login">
                    Admin Login
                </NavItem>
                {
                    true && (<NavItem eventKey={4} href="/dashboard">
                        Dashboard
                    </NavItem>)
                }

            </Nav>
        </Navbar>);
    }

}
