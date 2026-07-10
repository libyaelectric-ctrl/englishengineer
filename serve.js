const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const FILE = path.join(__dirname, 'public', 'engvox-landing.html');

http
  .createServer((req, res) => {
    fs.readFile(FILE, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}/engvox-landing.html`);
  });
