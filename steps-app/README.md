## STEPS Web Application  

The front-end component of the STEPS application.  

### Usage Instructions
1. git clone https://github.com/cmput401-fall2018/steps.git
2. cd steps/steps-app
3. npm install (or yarn install)
4. npm start (or yarn start)
5. Visit localhost:3000 in your browser

### Running Tests
#### Unit and integration tests can be run with the `npm test` command
#### e2e tests can be run with the `./node_modules/.bin/testcafe BROWSER ./testAutomation/tests` command, where BROWSER is the name of the browser you want to run with (chrome, firefox, safari)
#### In order to run e2e tests, you MUST have the web application running locally on your machine (npm start)