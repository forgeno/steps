## STEPS Web Application

[![Build Status](https://travis-ci.com/cmput401-fall2018/steps.svg?token=xJjZvyBEoyHCbmwNokpv&branch=master)](https://travis-ci.com/cmput401-fall2018/steps)

A React and Django application allowing users to review their experiences on the sidewalks of Edmonton.  
The site is currently hosted using Cybera, and can be accessed [here](http://199.116.235.159:8000/).

### Deployment Instructions
1. cd scripts && sh deployLocal.sh (Must be run from your local machine in the repository root directory)
2. git commit -a -m "build for deploy"
3. git push origin master
4. ssh onto the instance
5. cd steps2/steps (on the instance)
6. git pull origin master (on the instance)
7. sh scripts/deployCybera.sh (on the instance)
