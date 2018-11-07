# runs front-end tests for CI process
cd steps-app
set -e
npm install
export CI=true
npm start &
npm run test
sleep 10
./node_modules/.bin/testcafe chrome ./testAutomation/