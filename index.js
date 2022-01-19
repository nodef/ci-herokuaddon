const http = require('http');
const cp   = require('child_process');
const express   = require('express');
const toboolean = require('to-boolean');
const WebSocket = require('ws');
const Pool      = require('heroku-addonpool');

const OPTIONS = {
  timeout: 60000,
  ping:    10000,
  log:     false
};




function ciHerokuAddon(id, app, o) {
  console.log(`ciHerokuAddon`, {id, app, o});
  cp.execSync('pwd', {stdio: [0, 1, 2]})
  cp.execSync(`ls -al ~`, {stdio: [0, 1, 2]});

  var conn = 0;
  var pool = Pool(`${id}@pool`, app, o);
  var o = Object.assign({}, OPTIONS, o);

  function httpLog(msg)  {
    if(o.log) console.log(`${id}@http.${msg}`);
  }
  function wsLog(msg) {
    if(o.log) console.log(`${id}@ws.${msg}`);
  }

  var web = express();
  web.use((req, res) => {
    var c = conn++;
    httpLog(`connect(${c})`);
    pool.remove(c).then((ans) => {
      res.end(ans.value);
    });
    setTimeout(() => {
      if (c==null) return;
      httpLog(`timeout(${c})`);
      pool.add(c); c = null;
    }, o.timeout);
    res.on('close', () => {
      if (c==null) return;
      httpLog(`close(${c})`);
      pool.add(c); c = null;
    });
  });

  var wss = new WebSocket.Server({noServer: true});
  function wssPing() {
    for(var ws of wss.clients) {
      if(!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping('', false, true);
    }
  }

  setInterval(wssPing, o.ping);
  wss.on('connection', (ws) => {
    var c = conn++;
    ws.isAlive = true;
    ws.on('pong', () => ws.isAlive = true);
    wsLog(`connect(${c})`);
    pool.remove(c).then((ans) => {
      ws.send(ans.value);
    });
    ws.on('close', () => {
      wsLog(`close(${c})`);
      pool.add(c);
    });
  });

  return {'http': web, 'ws': wss, 'pool': pool};
};
module.exports = ciHerokuAddon;




function main() {
  console.log(`main`);
  var E = process.env, o = {};
  if (E.CI_TIMEOUT) o.timeout = parseInt(E.CI_TIMEOUT);
  if (E.CI_PING)    o.ping    = parseInt(E.CI_PING);
  if (E.CI_CONFIG)  o.config  = new RegExp(E.CI_CONFIG, 'g');
  if (E.CI_LOG)     o.log     = toboolean(E.CI_LOG);
  var app    = ciHerokuAddon(E.CI_ID, E.CI_APP, o);
  var server = http.createServer(app.http);
  server.on('upgrade', (req, soc, head) => {
    app.ws.handleUpgrade(req, soc, head, (ws) => app.ws.emit('connection', ws));
  }).listen(E.PORT||80);
  app.pool.setup();
}
if(require.main===module) main();
