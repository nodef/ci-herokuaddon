var http = require('http');
var cp = require('child_process');

var app = process.env.HEROKU_APP_NAME;
http.createServer(function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked',
    'X-Content-Type-Options': 'nosniff'
  });
  res.write('Hello World!');
}).listen(process.env.PORT);
