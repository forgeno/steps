import React from "react";
import Reflux from "reflux";
import { withStyles } from "@material-ui/core/styles";
import {Link} from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import {SECONDARY_COLOUR, FONT_FAMILY} from "../constants/ThemeConstants";
import SpamUtil from "../util/SpamUtil";
import AdminStore from "../admin/AdminStore";
import AdminActions from "../admin/AdminActions";

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
		},
		color: "white"
	},
	titleButton: {
		fontSize: 18,
		"&:hover": {
			color: SECONDARY_COLOUR
		},
		"&:focus": {
			color: SECONDARY_COLOUR
		},
		color: "white",
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

	_changeLogIn = () => {
		AdminActions.logoutAdmin();
		SpamUtil.deleteCookie("User");
		SpamUtil.deleteLocalStorage("LoginAttempts");
	}

	render() {
		const { classes } = this.props;
		return (
			<div className={classes.root}>
				<AppBar position="static">
					<Toolbar>
						<Link to="/"><Button color="inherit" className={classes.titleButton}>STEPS </Button> </Link>
						<Link to="/about/"><Button color="inherit" className={classes.button}>  About </Button></Link>
						<Link to="/statistics/"><Button color="inherit" className={classes.button}> <Link to="/statistics/"/> Statistics </Button></Link>
						{
							!this.state.isLoggedIn && <Link to="/login"><Button color="inherit" className={classes.button}> Login </Button> </Link>
						}
						{
							this.state.isLoggedIn && <Link to="/dashboard"><Button color="inherit" className={classes.button}>  Dashboard</Button></Link>
						}
						{
							this.state.isLoggedIn && <Button color="inherit" onClick={this._changeLogIn} className={classes.button}>Logout</Button>
						}
					</Toolbar>
				</AppBar>
			</div>
		);
	}
}

export default withStyles(styles)(NavbarComponent);