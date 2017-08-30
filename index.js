var http = require('http');
var express = require('express');
var WebSocket = require('ws');
var pool = require('./pool');

var app = process.env.HEROKU_APP;
var port = process.env.PORT||80;
var reqid = 0;

var x = express();
x.use((req, res) => {
  var id = reqid++;
  console.log(`server.httpconnect(${id})`);
  pool.remove(id).then((ans) => {
    res.end(pool.get(ans));
  });
  setTimeout(60000, () => {
    if(id==null) return;
    console.log(`server.supplytimeout(${id})`);
    pool.add(id); id = null;
  });
  res.on('close', () => {
    if(id==null) return;
    console.log(`server.httpclose(${id})`);
    pool.add(id); id = null;
  });
});

var server = http.createServer(x);
var wss = new WebSocket.Server({server});
wss.on('connection', (ws) => {
  var id = reqid++;
  ws.isAlive = true;
  console.log(`server.wsconnect(${id})`);
  pool.remove(id).then((ans) => {
    ws.send(pool.get(ans));
  });
  ws.on('close', () => {
    console.log(`server.wsclose(${id})`);
    ws.isAlive = false;
    pool.add(id);
  });
  var keepAlive = function() {
    if(!ws.isAlive) return;
    setTimeout(keepAlive, 8000);
    ws.ping();
  };
  setTimeout(keepAlive, 8000);
});

pool.setup(app).then((ans) => {
  server.listen(port);
});
