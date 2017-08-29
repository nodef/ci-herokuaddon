var http = require('http');

http.createServer(function(req, res) {
  console.log(process.env);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World!');
  res.end();
}).listen(process.env.PORT);
