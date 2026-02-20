import winston from 'winston';
import 'dotenv/config';
import http from 'http';
import packageJS from './package.json' assert { type: 'json' };

const STATUS_OK =200;
const STATUS_NOT_FOUND =404;

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
        const version = packageJS.version;
        const body = JSON.stringify({
            version: version,
        });
        res.writeHead(STATUS_OK, {
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
        res.writeHead(STATUS_NOT_FOUND).end('Nothing found on your search!!!');
    }
}).listen(process.env.PORT);
