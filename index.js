var http = require('http');
var Heroku = require('heroku.js');


var api = new Heroku();
var app = process.env.HEROKU_APP_NAME;

http.createServer(function(req, res) {
  api.addAddon(app, 'heroku-postgresql:hobby-dev', function(err, res) {
    if(err) throw err;
    console.log(res);
  });
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked',
    'X-Content-Type-Options': 'nosniff'
  });
  res.write('Hello World!');
}).listen(process.env.PORT);
