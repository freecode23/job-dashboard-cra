#  create env file that has env variables for react app
touch .env

for envvar in "$@" 
do
   echo "$envvar" >> .env
done
