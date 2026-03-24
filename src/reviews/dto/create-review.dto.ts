import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
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
