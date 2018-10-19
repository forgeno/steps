# deploy script
git pull origin master
cd steps-app
npm install
npm run build
mv build ../django_steps