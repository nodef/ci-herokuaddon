# ci-herokuaddon

[![NPM](https://nodei.co/npm/ci-herokuaddon.png)](https://nodei.co/npm/ci-herokuaddon/)

Heroku Addon Support for Continuous Integration.

```bash
# set heroku cli login in environment variables
HEROKU_CLI_LOGIN=youremail@domain.com
HEROKU_CLI_PASSWORD=yourpassword

# set server options in environment variables
# for PostgreSQL CI_CONFIG=(HEROKU_POSTGRESQL|DATABASE)\S*URL
CI_ID=yourname
CI_APP=yourpoolapp
CI_LOG=booleanvalue
CI_CONFIG=poolconfigregex
CI_PING=websocketpingperiodinmilliseconds
CI_TIMEOUT=httptimeoutinmilliseconds

# also as of now you also need to purge cache before build
heroku repo:purge_cache -a yourpoolapp
```
```javascript
// NOTE: this can also be used as a module
var AddonPool = require('ci-addonpool');
// AddonPool(<id>, <pool app>, <options>);

var pgpool = AddonPool('pgpool', 'mypoolapp', {
  'log': true,
  'config': /(HEROKU_POSTGRESQL|DATABASE)\S*URL/g,
  'ping': 8000,
  'timeout': 60000
});
```
