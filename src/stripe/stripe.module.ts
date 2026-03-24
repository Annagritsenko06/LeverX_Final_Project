import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import Stripe from 'stripe';
import { VinylsModule } from '../vinyls/vinyls.module';
import { AuthModule } from '../auth/auth.module';
import { STRIPE_CLIENT } from '../common/constants';

@Module({
  imports: [ConfigModule, VinylsModule, AuthModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    {
      provide: STRIPE_CLIENT,
      useFactory: (configService: ConfigService) => {
        const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
        if (!secretKey) {
          throw new Error(
            'STRIPE_SECRET_KEY is not defined in environment variables',
          );
        }
        return new Stripe(secretKey, { maxNetworkRetries: 2 });
      },
      inject: [ConfigService],
    },
  ],
  exports: [StripeService, STRIPE_CLIENT],
})
export class StripeModule {}
