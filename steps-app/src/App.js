import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './style/App.scss';

import MapDashboard from "./map/MapDashboard";
import AboutPageView from "./misc-components/AboutPageView";
import NavbarComponent from "./misc-components/NavbarComponent";
import SummaryStatisticsView from "./summary/SummaryStatisticsView";

class App extends Component {

  render() {
    return (
      <div className="App">
        <NavbarComponent />
		<Switch>
			<Route path="/about/" component={AboutPageView} />
			<Route path="/statistics" component={SummaryStatisticsView} />
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
