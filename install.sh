mkdir -p tmp lib
pushd tmp
wget ${HEROKU_CLI_URL} -O heroku.tar.gz
tar -xvzf heroku.tar.gz
popd
ls tmp
ls tmp/heroku-cli-*
mv $(ls tmp/heroku-cli-*) lib/heroku
ls lib/heroku
ln -s $PWD/lib/heroku/bin/heroku $PWD/heroku
