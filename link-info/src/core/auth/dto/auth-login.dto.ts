import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({
    description: 'Enter email address',
    example: 'example@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Enter strong password',
    example: '@Example123',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
