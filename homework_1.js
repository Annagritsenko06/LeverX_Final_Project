const winston = require('winston');
require('dotenv').config();
const http = require('http');
const packageJS = require('./package.json');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: process.env.filename }),
    ],
});
http.createServer((req, res) => {
    if (req.method == 'GET' && req.url.startsWith('/health')) {
        logger.info(
            `Get request. Url: ${req.url}, port: ${req.socket.localPort}`
        );
        var version = packageJS.version;
        var body = JSON.stringify({
            version: version,
        });
        res.writeHead(200, {
            'Content-Type': 'application/json',
            Server: 'Node.js',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
            Date: new Date().toUTCString(),
        }).end(body);
    } else {
        logger.warn(
            `Nothing found on your search!!! Unknown URL:  ${req.url} , port : ${req.socket.localPort}.`
        );
        res.writeHead(404).end('Nothing found on your search!!!');
    }
}).listen(process.env.PORT);
