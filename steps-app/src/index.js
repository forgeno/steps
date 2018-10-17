import React from "react";
import ReactDOM from "react-dom";
import "./style/index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";

import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import purple from "@material-ui/core/colors/purple";
import {SECONDARY_COLOUR} from "./constants/ThemeConstants";

const theme = createMuiTheme({
	palette: {
		primary: purple,
		secondary: {
			main: SECONDARY_COLOUR,
		}
	}
});

ReactDOM.render(
	<BrowserRouter>
		<MuiThemeProvider theme={theme}>
			<App />
		</MuiThemeProvider>
	</BrowserRouter>,
	document.getElementById("root")
);

serviceWorker.unregister();
