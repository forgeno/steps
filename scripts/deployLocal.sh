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
echo "Adding all new files to git..."
git add -A
echo "Commiting changes to git..."
git commit -m "Redploying build using script 1.0"
echo "Pushing changes to master for deployment..."
git push origin master
echo "Done running deploy script!"