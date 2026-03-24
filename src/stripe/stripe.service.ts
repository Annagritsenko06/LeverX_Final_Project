import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VinylsService } from '../vinyls/vinyls.service';
import { STRIPE_CLIENT } from '../common/constants';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject(STRIPE_CLIENT) private stripe: Stripe,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private vinylsService: VinylsService,
  ) {}

  async createPaymentIntent(
    userId: string,
    amount: number,
    vinylName: string,
    email?: string,
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    purchasedData?: Date;
  }> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId, vinylName },
      receipt_email: email || this.configService.get('EMAIL_USER'),
    });

    const purchasedData = await this.vinylsService.addPurchaseVinyl(
      userId,
      vinylName,
    );
    this.eventEmitter.emit('vinylPurchased', {
      userEmail: email || this.configService.get('EMAIL_USER'),
      vinylName,
      amount,
      paymentIntentId: paymentIntent.id,
      status: 'success',
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      purchasedData: purchasedData?.purchasedAt,
    };
  }
}
