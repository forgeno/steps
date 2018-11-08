# deploy script
git fetch
git pull origin master
cd ../steps-app
npm install
npm run build
echo "Removing old build file in ../django_steps/build/"
rm -r ../django_steps/build/
echo "Moving new build folder into ../django_steps/"
mv build ../django_steps/
echo "Done running deploy script!"
