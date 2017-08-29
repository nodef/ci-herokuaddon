mkdir tmp lib
pushd tmp
wget ${HEROKU_CLI_URL} -O heroku.tar.gz
tar -xvzf heroku.tar.gz
popd
echo "-------"
echo tmp:
ls tmp
echo "-------"
echo .:
ls
echo "-------"
echo tmp:
ls -d tmp
echo "-------"
mv $(ls -d tmp) lib/heroku
echo "-------"
echo lib/heroku
ls lib/heroku
echo "-------"
echo lib/heroku/bin:
ls lib/heroku/bin
echo "-------"
ln -s $PWD/lib/heroku/bin/heroku $PWD/heroku
echo "-------"
echo .:
ls
echo "-------"
