import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthRequest } from '../types/types';

@ApiTags('stripe')
@ApiBearerAuth()
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('purchase')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Purchase vinyl' })
  async purchaseVinyl(
    @Request() req: AuthRequest,
    @Body() createPurchaseDto: CreatePurchaseDto,
  ) {
    const userId = req.user.id;
    const { vinylName, amount, email } = createPurchaseDto;

    const result = await this.stripeService.createPaymentIntent(
      userId,
      amount,
      vinylName,
      email,
    );

    return {
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    };
  }
}
