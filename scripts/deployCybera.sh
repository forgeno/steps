echo "Running persistant server"
git fetch
git pull origin master
nohup python3 ../django_steps/manage.py runserver 0.0.0.0:8000
echo "Finished deploying server"