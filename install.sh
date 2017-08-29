mkdir -p tmp lib
pushd tmp
wget ${HEROKU_CLI_URL} -O heroku.tar.gz
tar -xvzf heroku.tar.gz
popd
mv $(ls tmp/heroku-cli-*) lib/heroku
ln -s lib/heroku/bin/heroku heroku
