import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './style/App.scss';
import MapDashboard from "./map/MapDashboard";

import NavbarComponent from "./misc-components/NavbarComponent";

class App extends Component {

  render() {
    return (
      <div className="App">
        <NavbarComponent />
		<Switch>
			<Route path="/about/" component={MapDashboard} />
			<Route path="/statistics" component={MapDashboard} />
			<Route path="/login" component={MapDashboard} />
			<Route path="/map/:id" component={MapDashboard} />
            <Route path="/dashboard" component={MapDashboard} />
			<Route path="/" component={MapDashboard} />
		</Switch>
      </div>
    );
  }
}

export default App
