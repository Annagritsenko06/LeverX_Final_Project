import express from 'express';
import 'dotenv/config';
import packageJS from '../package.json' with { type: 'json' };
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { logger } from './common/logger.js';
import { STATUS_OK, STATUS_NOT_FOUND } from './common/constants.js';
import { MESSAGES } from './common/messages.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    logger.info(`Get request. Url: ${req.url}, port: ${req.socket.localPort}`);
    res.set({
        'Content-Type': 'application/json',
        Server: 'Node.js',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        Date: new Date().toUTCString(),
    });
    const version = packageJS.version;
    res.status(STATUS_OK).json({
        version: version,
    });
});

app.use('/users', userRoutes);
app.use('/posts', postRoutes);

app.use((req, res) => {
    res.status(STATUS_NOT_FOUND)
        .type('text/plain')
        .send(MESSAGES.NOTHING_FOUND);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
