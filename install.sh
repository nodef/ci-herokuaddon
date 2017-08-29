mkdir tmp lib
pushd tmp
wget ${HEROKU_CLI_URL} -O heroku.tar.gz
tar -xvzf heroku.tar.gz
popd
echo "-------"
ls tmp
echo "-------"
ls tmp/heroku-cli-*
echo "-------"
ls tmp/heroku-cli-*
echo "-------"
mv $(ls tmp/heroku-cli-*) lib/heroku
echo "-------"
ls lib/heroku
echo "-------"
ln -s $PWD/lib/heroku/bin/heroku $PWD/heroku
