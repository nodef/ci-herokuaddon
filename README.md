Heroku Addon Support for Continuous Integration.

```text
I wanted to have a PostgreSQL server (connection string) for running tests
in Travis CI (an automated testing and deploying system). SO, this is the
result. You can connect to this server using HTTP or WebSocket. Once this
app has a free database in its pool, it will return its connections string
upon connection. You can use it any way you like to run your tests, and then
when you are done, you can simply disconnect, which will release the database
back to the pool, where it is reset and login credentials are changed. Note:
with HTTP however, there is a timeout after which you are automatically
considered disconnected.

Hosted PostgreSQL CI:
https://ci-postgresql.herokuapp.com/
wss://ci-postgresql.herokuapp.com/
```

```bash
# NOTE:
# The app with addons (pool app) must be different from the app
# that uses the addons because heroku resets the pool app each
# time a configuration variable is changed.
```

<br>
<br>

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

<br>

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
