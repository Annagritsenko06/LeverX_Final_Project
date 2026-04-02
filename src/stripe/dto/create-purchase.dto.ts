import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'Vinyl name (for payment metadata)',
    example: 'The Dark Side of the Moon',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  vinylName: string;

  @ApiProperty({
    description: 'Payment amount in cents (e.g., 2000 = $20.00)',
    example: 2999,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  @Min(100)
  amount: number;

  @ApiProperty({
    description:
      'Email for Stripe receipt (optional, taken from JWT by default)',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  email?: string;
}
