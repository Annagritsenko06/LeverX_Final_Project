import { IsNotEmpty, IsString, IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'vinylId cant be empty' })
  @IsUUID('all', { message: 'vinylId must be UUID' })
  vinylId: string;

  @ApiProperty({ default: 'Good  vinyl' })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'Review score',
    default: '5',
    example: '3',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5'], {
    message: 'reviewScore must be between 1 and 5',
  })
  reviewScore: string;
}
