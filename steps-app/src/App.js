import React, { Component } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import './style/App.scss';
import { withRouter } from 'react-router-dom';


import MapDashboard from "./map/MapDashboard";
import AboutPageView from "./misc-components/AboutPageView";
import AdminPanelView from "./admin/AdminPanelView";
import NavbarComponent from "./misc-components/NavbarComponent";
import AdminLogin from "./admin/AdminLogin";
import SummaryStatisticsView from "./summary/SummaryStatisticsView";

class App extends Component {

  render() {
    return (
      <div className="App">
        <NavbarComponent />
        <Switch>
          <Route path="/about/" component={AboutPageView} />
          <Route path="/statistics" component={SummaryStatisticsView} />
          <Route path="/login" component={AdminLogin} />
          <Route path="/map/:id" component={MapDashboard} />
          <Route path="/dashboard" component={AdminPanelView} />
          <Route path="/" component={MapDashboard} />
        </Switch>
      </div>
    );
  }
}

export default App
