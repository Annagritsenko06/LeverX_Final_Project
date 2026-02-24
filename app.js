import winston from 'winston';
import 'dotenv/config';
import express from 'express';
import packageJS from './package.json' with { type: 'json' };
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { EventEmitter } from 'events';
import fs from 'fs';
import nodemailer from 'nodemailer';

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;
const STATUS_CONFLICT = 409;
const STATUS_CREATED = 201;
const STATUS_SERVER_ERROR = 500;
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;
const salt = 8;
const DATA_FILE = 'Users_data.json';
const POSTS_FILE = 'Users_posts.json';

const usersUpdate = new EventEmitter();
usersUpdate.on('profileUpdated', async (userEmail, newName, newLastname) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Upgrade',
            text: `Hello! Your profile was updated.
                  New Name: ${newName}
                  New Lastname: ${newLastname}`,
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
});
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: process.env.filename }),
    ],
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(STATUS_UNAUTHORIZED).send(
            'You don’t have access to this resource'
        );
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.status(STATUS_FORBIDDEN).send('Token expired');
        }
        console.log('req.user:', user);
        req.user = user;
        next();
    });
}

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

app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;

    const readStream = fs.createReadStream(DATA_FILE, 'utf8');
    readStream
        .on('data', async (data) => {
            try {
                const users = JSON.parse(data.toString());
                const user = users.find((u) => u.Email === Email);

                if (!user) {
                    res.status(STATUS_NOT_FOUND).json({
                        error: 'User not found',
                    });
                }

                const isValid = await bcrypt.compare(Password, user.Password);

                if (isValid) {
                    const payload = {
                        Id: user.Id,
                        Name: user.Name,
                        Lastname: user.Lastname,
                        Email: user.Email,
                    };

                    const token = jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN,
                    });
                    res.json({
                        success: true,
                        token: token,
                        userEmail: user.Email,
                    });
                } else {
                    res.status(STATUS_UNAUTHORIZED).json({
                        error: 'Wrong password',
                    });
                }
            } catch (err) {
                res.status(STATUS_SERVER_ERROR).json({
                    error: 'Error reading file',
                });
            }
        })
        .on('error', () => {
            res.status(STATUS_NOT_FOUND).json({ error: 'File not found' });
        });
});
app.post('/auth', authenticateToken, (req, res) => {
    res.status(STATUS_OK).json({
        Name: req.user.Name,
        Lastname: req.user.Lastname,
        Email: req.user.Email,
    });
});

app.post('/register', async (req, res) => {
    const { Name, Lastname, Email, Password } = req.body;
    try {
        let fileData = '';
        const readStream = fs.createReadStream(DATA_FILE, 'utf8');
        readStream.on('data', (chunk) => {
            fileData += chunk;
        });
        readStream.on('end', async () => {
            let users = [];
            if (fileData.trim().length > 0) {
                users = JSON.parse(fileData);
            }

            const existingUser = users.find((u) => u.Email === Email);
            if (existingUser) {
                res.status(STATUS_CONFLICT).json({
                    error: 'User already exists',
                });
            } else {
                const user_id = randomUUID();
                const passwordHash = await bcrypt.hash(Password, salt);
                const newUser = {
                    Id: user_id,
                    Name: Name,
                    Lastname: Lastname,
                    Email: Email,
                    Password: passwordHash,
                };

                users.push(newUser);
                const writeStream = fs.createWriteStream(DATA_FILE, {
                    flags: 'w',
                    encoding: 'utf8',
                });

                writeStream.write(JSON.stringify(users, null, 2) + '\n');
                writeStream.end();
                writeStream.on('finish', () =>
                    res.status(STATUS_CREATED).json({
                        success: true,
                        message: 'User successfully registered',
                        userName: Name,
                    })
                );
            }
        });
    } catch (error) {
        res.status(STATUS_SERVER_ERROR).json({
            error: 'Internal Server Error',
        });
    }
});

app.put('/profile', authenticateToken, (req, res) => {
    const { Name, Lastname } = req.body;

    if (!Name || !Lastname) {
        res.status(STATUS_CONFLICT).send('Entered data is empty');
    }

    try {
        let fileData = '';
        const readStream = fs.createReadStream(DATA_FILE, 'utf8');
        readStream.on('data', (chunk) => {
            fileData += chunk;
        });
        readStream.on('end', async () => {
            let users = [];
            if (fileData.trim().length > 0) {
                users = JSON.parse(fileData);
            }

            const userIndex = users.findIndex(
                (u) => u.Email === req.user.Email
            );
            if (userIndex === -1) {
                res.status(STATUS_NOT_FOUND).json({
                    error: 'User not found',
                });
            }

            users[userIndex].Name = Name;
            users[userIndex].Lastname = Lastname;

            const writeStream = fs.createWriteStream(DATA_FILE, {
                flags: 'w',
                encoding: 'utf8',
            });

            writeStream.write(JSON.stringify(users, null, 2) + '\n');
            writeStream.end();
            writeStream.on('finish', () => {
                usersUpdate.emit(
                    'profileUpdated',
                    req.user.Email,
                    Name,
                    Lastname
                );
                res.status(STATUS_OK).json({
                    success: true,
                    message: 'User successfully updated',
                    NewuserName: Name,
                    NewLastname: Lastname,
                });
            });
        });
    } catch (error) {
        res.status(STATUS_SERVER_ERROR).json({
            error: 'Internal Server Error',
        });
    }
});

app.post('/createPost', authenticateToken, (req, res) => {
    const { Title, Description } = req.body;
    try {
        let fileData = '';
        const readStream = fs.createReadStream(POSTS_FILE, 'utf8');
        readStream.on('data', (chunk) => {
            fileData += chunk;
        });
        readStream.on('end', async () => {
            let posts = [];
            if (fileData.trim().length > 0) {
                posts = JSON.parse(fileData);
            }

            const created_data = new Date();

            const post_id = randomUUID();
            const newPost = {
                authorId: req.user.Id,
                Post_id: post_id,
                Title: Title,
                Description: Description,
                Created_data: created_data,
            };

            posts.push(newPost);
            const writeStream = fs.createWriteStream(POSTS_FILE, {
                flags: 'w',
                encoding: 'utf8',
            });

            writeStream.write(JSON.stringify(posts, null, 2) + '\n');
            writeStream.end();
            writeStream.on('finish', () =>
                res.status(STATUS_CREATED).json({
                    success: true,
                    message: 'Post successfully created',
                    Title: Title,
                    Created_data: created_data,
                })
            );
        });
    } catch (error) {
        res.status(STATUS_SERVER_ERROR).json({
            error: 'Internal Server Error',
        });
    }
});

app.get('/userPosts', authenticateToken, (req, res) => {
    try {
        let postsFileData = '';
        const postsStream = fs.createReadStream(POSTS_FILE, 'utf8');
        postsStream.on('data', (chunk) => {
            postsFileData += chunk;
        });

        postsStream.on('end', async () => {
            let posts = [];
            if (postsFileData.trim().length > 0) {
                posts = JSON.parse(postsFileData);
            }

            let usersFileData = '';
            const usersStream = fs.createReadStream(DATA_FILE, 'utf8');
            usersStream.on('data', (chunk) => {
                usersFileData += chunk;
            });

            usersStream.on('end', () => {
                let users = [];
                if (usersFileData.trim().length > 0) {
                    users = JSON.parse(usersFileData);
                }

                const userPosts = posts.filter(
                    (post) => post.authorId === req.user.Id
                );

                const postsWithAuthor = userPosts.map((post) => {
                    const author = users.find((u) => u.Id === post.authorId);
                    return {
                        Title: post.Title,
                        Description: post.Description,
                        Created_data: post.Created_data,
                        Author: author
                            ? `${author.Name} ${author.Lastname}`
                            : 'Unknown author',
                    };
                });

                res.status(STATUS_OK).json({
                    success: true,
                    posts: postsWithAuthor,
                });
            });
        });
    } catch (error) {
        res.status(STATUS_SERVER_ERROR).json({
            error: 'Internal Server Error',
        });
    }
});

app.put('/userPosts/:postId', authenticateToken, (req, res) => {
    const { Title, Description } = req.body;
    const { postId } = req.params;
    try {
        let fileData = '';
        const readStream = fs.createReadStream(POSTS_FILE, 'utf8');
        readStream.on('data', (chunk) => {
            fileData += chunk;
        });
        readStream.on('end', async () => {
            let posts = [];
            if (fileData.trim().length > 0) {
                posts = JSON.parse(fileData);
            }
            const postIndex = posts.findIndex(
                (post) =>
                    post.authorId === req.user.Id && post.Post_id === postId
            );
            if (postIndex === -1) {
                res.status(STATUS_NOT_FOUND).json({ error: 'Post not found' });
            }
            const created_data = new Date();
            posts[postIndex].Title = Title;
            posts[postIndex].Description = Description;
            posts[postIndex].Updated_data = created_data;
            const writeStream = fs.createWriteStream(POSTS_FILE, {
                flags: 'w',
                encoding: 'utf8',
            });

            writeStream.write(JSON.stringify(posts, null, 2) + '\n');
            writeStream.end();
            writeStream.on('finish', () =>
                res.status(STATUS_OK).json({
                    success: true,
                    message: 'Post successfully updated',
                    Title: Title,
                    Created_data: created_data,
                })
            );
        });
    } catch (error) {
        res.status(STATUS_SERVER_ERROR).json({
            error: 'Internal Server Error',
        });
    }
});

app.delete('/userPosts/:postId', authenticateToken, (req, res) => {
    const { postId } = req.params;
    try {
        let fileData = '';
        const readStream = fs.createReadStream(POSTS_FILE, 'utf8');
        readStream.on('data', (chunk) => {
            fileData += chunk;
        });
        readStream.on('end', async () => {
            let posts = [];
            if (fileData.trim().length > 0) {
                posts = JSON.parse(fileData);
            }
            const postIndex = posts.findIndex(
                (post) =>
                    post.Post_id === postId && post.authorId === req.user.Id
            );
            if (postIndex === -1) {
                res.status(STATUS_NOT_FOUND).json({ error: 'Post not found' });
            }
            posts.splice(postIndex, 1);
            const writeStream = fs.createWriteStream(POSTS_FILE, {
                flags: 'w',
                encoding: 'utf8',
            });

            writeStream.write(JSON.stringify(posts, null, 2) + '\n');
            writeStream.end();
            writeStream.on('finish', () =>
                res.status(STATUS_OK).json({
                    success: true,
                    message: 'Post successfully deleted',
                })
            );
        });
    } catch (error) {
        res.status(STATUS_SERVER_ERROR).json({
            error: 'Internal Server Error',
        });
    }
});

app.use((req, res) => {
    res.status(STATUS_NOT_FOUND)
        .type('text/plain')
        .send('Nothing found on your search!!!');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
