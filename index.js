var http = require('http');
var pool = require('./pool');

var app = process.env.HEROKU_APP_NAME;
var port = process.env.PORT||80;
var server = http.createServer().listen(port);

pool.setup(app).then((ans) => {
  server.on('request', (req, res) => {
    var id = req.socket.fd;
    console.log(`server.request(${id})`);
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff'
    });
    pool.remove(id).then((ans) => {
      var val = pool.get(ans);
      console.log(`server.request:poolRemove(${val})`);
      res.write(val);
    });
    var onend = function() {
      console.log(`server.request:end(${id})`);
      pool.add(id);
    };
    req.on('aborted', onend);
    req.on('close', onend);
  });
});
