mkdir tmp lib
pushd tmp
wget ${HEROKU_CLI_URL} -O heroku.tar.gz
tar -xvzf heroku.tar.gz
popd
echo "-------"
ls tmp
echo "-------"
ls
echo "-------"
ls tmp/*/
echo "-------"
mv $(ls tmp/*/) lib/heroku
echo "-------"
ls lib/heroku
echo "-------"
ln -s $PWD/lib/heroku/bin/heroku $PWD/heroku
