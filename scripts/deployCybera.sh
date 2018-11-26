echo "Running persistant server"
git fetch
git pull origin master
rm -rf /var/www/html/steps
rm -rf django_steps/build
mv steps-app/build django_steps/build
cp -R django_steps /var/www/html/steps
chmod -R 777 /var/www/html/steps
sudo service apache2 restart
echo "Finished deploying server"
