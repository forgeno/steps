import React from "react";
import Reflux from "reflux";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import {SECONDARY_COLOUR, FONT_FAMILY} from "../constants/ThemeConstants";

import AdminStore from "../admin/AdminStore";

const styles = {
	root: {
		flexGrow: 1,
	},
	menuButton: {
		marginLeft: -12,
		marginRight: 20,
	},
	button: {
		fontSize: 14,
		"&:hover": {
			color: SECONDARY_COLOUR
		},
		"&:focus": {
			color: SECONDARY_COLOUR
		}
	},
	titleButton: {
		fontSize: 18,
		"&:hover": {
			color: SECONDARY_COLOUR
		},
		"&:focus": {
			color: SECONDARY_COLOUR
		},
		fontFamily: FONT_FAMILY
	}
};

/**
 * This component renders the global navigation bar at the top of the page
 */
class NavbarComponent extends Reflux.Component {

	constructor(props) {
		super(props);
		this.store = AdminStore;
	}

	render() {
		const { classes } = this.props;
		return (
			<div className={classes.root}>
				<AppBar position="static">
					<Toolbar>
						<Button color="inherit" className={classes.titleButton} href="/">STEPS</Button>
						<Button color="inherit" className={classes.button} href="/about">About</Button>
						<Button color="inherit" className={classes.button} href="/statistics">Statistics</Button>
						{
							!this.state.isLoggedIn && <Button color="inherit" className={classes.button} href="/login">Login</Button>
						}
						{
							this.state.isLoggedIn && <Button color="inherit" className={classes.button} href="/dashboard">Dashboard</Button>
						}
					</Toolbar>
				</AppBar>
			</div>
		);
	}
}

export default withStyles(styles)(NavbarComponent);