import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const usersUpdate = new EventEmitter();
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
