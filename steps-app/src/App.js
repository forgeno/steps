import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './style/App.css';
import MapDashboard from "./map/MapDashboard";

class App extends Component {
	
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
		<Switch>
			<Route path="/" component={MapDashboard} />
			<Route path="/map/:id" component={MapDashboard} />
			<Route path="/about" component={MapDashboard} />
			<Route path="/statistics" component={MapDashboard} />
			<Route path="/login" component={MapDashboard} />
		</Switch>
      </div>
    );
  }
}

export default App;
