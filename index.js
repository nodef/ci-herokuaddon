var http = require('http');
var pool = require('./pool');

var app = process.env.HEROKU_APP_NAME;
var port = process.env.PORT||80;
var server = http.createServer().listen(port);

pool.setup(app).then((ans) => {
  server.on('request', (req, res) => {
    var id = req.socket;
    console.log(`server.request(${id})`);
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff'
    });
    pool.remove(id).then((ans) => {
      res.write(pool.get(ans));
    });
    var onend = function() {
      console.log(`server.request:end(${id})`);
      pool.add(id);
      res.end();
    };
    req.on('aborted', onend);
    req.on('close', onend);
  });
});
