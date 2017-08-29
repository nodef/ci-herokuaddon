mkdir lib
pushd lib
wget ${HEROKU_CLI_URL} -O heroku.tar.gz
tar -xvzf heroku.tar.gz
mv $(ls|head -n 1) heroku
popd
ln -s $PWD/lib/heroku/bin/heroku $PWD/heroku
chmod 777 heroku
