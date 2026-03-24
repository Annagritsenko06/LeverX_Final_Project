import {
  IsNotEmpty,
  MinLength,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastname: string;

  @ApiProperty()
  @IsString()
  avatar: string;

  @ApiProperty({
    default: '2024-01-01',
    description: 'Data format  YYYY-MM-DD',
  })
  @IsDateString()
  birthdate: string;
}
