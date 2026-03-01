import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import { MESSAGES } from '../common/messages.js';

export const notification = new EventEmitter();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

notification.on(
    'profileUpdated',
    async (userEmail: string, newName: string, newLastname: string) => {
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
            console.error(MESSAGES.EMAIL_SENDING_ERROR, error);
        }
    }
);
