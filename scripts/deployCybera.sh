echo "Running persistant server"
git fetch
git pull origin master
rm -rf /var/www/html/steps
cp -R django_steps /var/www/html/steps
sudo service apache2 restart
echo "Finished deploying server"
