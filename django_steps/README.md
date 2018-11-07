## STEPS Django Application  

The back-end component of the STEPS application. This consists of Django, and the Django REST Framework.  

### Usage Instructions
1. git clone https://github.com/cmput401-fall2018/steps.git
2. cd steps/django_steps
3. pip install -r requirements.txt
4. python3 ./manage.py migrate
5. python3 ./manage.py runserver
6. visit 127.0.0.1:8000 in your browser

### Running Tests
#### Functional tests can be run with the `python3 ./manage.py test api.tests` command