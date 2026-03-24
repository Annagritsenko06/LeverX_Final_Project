import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { MESSAGES } from '../common/messages';

@Injectable()
export class NotificationService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  @OnEvent('profileUpdated')
  async handlerProfileUpdate(
    userEmail: string,
    newName: string,
    newLastname: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
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

  @OnEvent('vinylPurchased')
  async handleVinylPurchase(payload: {
    userEmail: string;
    vinylName: string;
    amount: number;
    paymentIntentId: string;
    status: 'success' | 'failed';
  }): Promise<void> {
    try {
      const { userEmail, vinylName, amount, paymentIntentId, status } = payload;
      const emailUser = this.configService.get<string>('EMAIL_USER');

      const subject =
        status === 'success'
          ? `Vinyl Purchase Successful - ${vinylName}`
          : ` Payment Failed - ${vinylName}`;

      const statusMessage =
        status === 'success'
          ? `Congratulations! Your payment for "${vinylName}" was successful. Your vinyl will be shipped soon.`
          : `Your payment attempt for "${vinylName}" failed. Please try again.`;

      await this.transporter.sendMail({
        from: `"Vinyl Store" <${emailUser}>`,
        to: userEmail,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p><strong>Vinyl:</strong> ${vinylName}</p>
            <p><strong>Amount:</strong> ${(amount / 100).toFixed(2)}</p>
            <p><strong>Payment ID:</strong> ${paymentIntentId}</p>
            <p><strong>Status:</strong> ${status.toUpperCase()}</p>
            <hr>
            <p>${statusMessage}</p>
            ${status === 'success' ? '<p>Thank you for your purchase! </p>' : '<p>If you have any questions, contact support.</p>'}
          </div>
        `,
        text: `${subject}\n\nVinyl: ${vinylName}\nAmount: ${(amount / 100).toFixed(2)}\nPayment ID: ${paymentIntentId}\nStatus: ${status.toUpperCase()}\n\n${statusMessage}`,
      });
    } catch (error) {
      console.error(MESSAGES.EMAIL_SENDING_ERROR, error);
    }
  }

  async sendVinylPurchaseNotification(payload: {
    userEmail: string;
    vinylName: string;
    amount: number;
    paymentIntentId: string;
    status: 'success' | 'failed';
  }): Promise<void> {
    return this.handleVinylPurchase(payload);
  }
}
