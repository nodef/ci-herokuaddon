#!/bin/bash

# download
mkdir lib
pushd lib
wget ${HEROKU_CLI_URL} -O heroku.tar.gz
tar -xvzf heroku.tar.gz
mv $(ls|head -n 1) heroku
popd
chmod 777 heroku

# login
f="~/.netrc"
echo "" > ${f}
echo "machine api.heroku.com" >> ${f}
echo "  password ${HEROKU_PASSWORD}" >> ${f}
echo "  login ${HEROKU_EMAIL}" >> ${f}
echo "machine git.heroku.com" >> ${f}
echo "  password ${HEROKU_PASSWORD}" >> ${f}
echo "  login ${HEROKU_EMAIL}" >> ${f}
