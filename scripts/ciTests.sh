# runs front-end and back-end tests for CI process
cd steps-app
set -e
npm install
export CI=true
npm run test
cd ../django_steps/api
# TODO: back-end tests
