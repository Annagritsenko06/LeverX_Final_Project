import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import nodemailer from 'nodemailer';
import { MESSAGES } from '../common/messages.js';
@Injectable()
export class NotificationService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  @OnEvent('profileUpdated')
  async handlerProfileUpdate(
    userEmail: string,
    newName: string,
    newLastname: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
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
}
