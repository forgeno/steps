## STEPS Web Application  

The front-end component of the STEPS application.  

### Usage Instructions
1. git clone https://github.com/cmput401-fall2018/steps.git
2. cd steps/steps-app
3. npm install (or yarn install)
4. npm start (or yarn start)
5. Visit localhost:3000 in your browser

### Deployment Instructions
1. sh scripts/deploy.sh (Must be run from your local machine in the repository root directory)
2. git commit -a -m "build for deploy"
3. git push origin master
4. ssh onto the instance
5. cd steps (on the instance)
6. git pull origin master (on the instance)

### Running Tests
#### Unit and integration tests can be run with the `npm test` command
#### e2e tests can be run with the `./node_modules/.bin/testcafe BROWSER ./testAutomation/tests` command, where BROWSER is the name of the browser you want to run with (chrome, firefox, safari)
