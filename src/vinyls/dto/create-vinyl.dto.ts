import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVinylDto {
  @ApiProperty({ minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ minLength: 10, maxLength: 2000, example: 'Super Vinyl' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: '123' })
  @IsNotEmpty()
  @MinLength(1)
  price: string;

  @ApiProperty({ minLength: 3, maxLength: 10 })
  @IsNotEmpty()
  @MinLength(3)
  authorName: string;

  @ApiProperty({ example: 'https://example.com/images/vinyl-cover.jpg' })
  @IsUrl()
  @IsNotEmpty()
  image: string;
}
