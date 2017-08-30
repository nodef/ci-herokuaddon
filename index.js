var http = require('http');
var pool = require('./pool');

var app = process.env.HEROKU_APP;
var port = process.env.PORT||80;
var server = http.createServer().listen(port);
var reqid = 0;

pool.setup(app).then((ans) => {
  server.on('request', (req, res) => {
    var id = reqid++;
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
    // req.on('aborted', onend);
    // req.on('close', onend);
    res.on('close', onend);
  });
});
