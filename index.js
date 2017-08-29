var http = require('http');

console.log(process.env.HEROKU_APP_NAME);
http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World!');
}).listen(process.env.PORT);
