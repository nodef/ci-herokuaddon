var http = require('http');
var express = require('express');
var toboolean = require('to-boolean');
var WebSocket = require('ws');
var Pool = require('heroku-addonpool');

var $ = function(id, app, opt) {
  var conn = 0;
  var pool = Pool(`${id}@pool`, app, opt);
  var opt = opt||{};
  opt.timeout = opt.timeout||60000;
  opt.ping = opt.ping||10000;
  opt.log = opt.log||false;

  var httplog = function(msg) {
    if(opt.log) console.log(`${id}@http.${msg}`);
  };

  var wslog = function(msg) {
    if(opt.log) console.log(`${id}@ws.${msg}`);
  };

  var web = express();
  web.use((req, res) => {
    var c = conn++;
    httplog(`connect(${c})`);
    pool.remove(c).then((ans) => {
      res.end(ans.value);
    });
    setTimeout(() => {
      if(c==null) return;
      httplog(`timeout(${c})`);
      pool.add(c); c = null;
    }, opt.timeout);
    res.on('close', () => {
      if(c==null) return;
      httplog(`close(${c})`);
      pool.add(c); c = null;
    });
  });

  var wss = new WebSocket.Server({'noServer': true});
  var wssPing = () => {
    for(var ws of wss.clients) {
      if(!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping('', false, true);
    }
  };
  setInterval(wssPing, opt.ping);
  wss.on('connection', (ws) => {
    var c = conn++;
    ws.isAlive = true;
    ws.on('pong', () => ws.isAlive = true);
    wslog(`connect(${c})`);
    pool.remove(c).then((ans) => {
      ws.send(ans.value);
    });
    ws.on('close', () => {
      wslog(`close(${c})`);
      pool.add(c);
    });
  });

  return {'http': web, 'ws': wss, 'pool': pool};
};
module.exports = $;

if(require.main===module) {
  var e = process.env;
  var opt = {};
  if(e.CI_TIMEOUT) opt.timeout = parseInt(e.CI_TIMEOUT);
  if(e.CI_PING) opt.ping = parseInt(e.CI_PING);
  if(e.CI_CONFIG) opt.config = new RegExp(e.CI_CONFIG, 'g');
  if(e.CI_LOG) opt.log = toboolean(e.CI_LOG);
  var app = $(e.CI_ID, e.CI_APP, opt);
  var server = http.createServer(app.http);
  server.on('upgrade', (req, soc, head) => {
    app.ws.handleUpgrade(req, soc, head, (ws) => app.ws.emit('connection', ws));
  });
  server.listen(e.PORT||80);
  app.pool.setup();
}
