import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  token: string;

  @ApiProperty()
  userEmail: string;
}
