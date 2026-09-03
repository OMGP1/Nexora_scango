const httpProxy = require('http-proxy');
const http = require('http');

const proxy = httpProxy.createProxyServer({});
proxy.on('error', function (err, req, res) {
  console.log('Proxy Error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Something went wrong.');
});

const server = http.createServer(function(req, res) {
  proxy.web(req, res, { target: 'http://127.0.0.1:3000' });
});

console.log("listening on port 5179")
server.listen(5179);
