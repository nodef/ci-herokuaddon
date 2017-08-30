var http = require('http');
var pool = require('./pool');

var app = process.env.HEROKU_APP_NAME;
var port = process.env.PORT||80;

var server = function() {
  http.createServer(function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff'
    });
    res.write('Hello World!');
  }).listen(port);
};

pool.setup(app).then(() => {
  server();
});
