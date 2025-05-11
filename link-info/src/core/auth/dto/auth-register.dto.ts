import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class AuthRegisterDto {
  @ApiProperty({
    description: 'Enter email address',
    example: 'example@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Create username',
    example: 'exampleUsername',
  })
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: 'Enter strong password',
    example: '@Example123',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  readonly password: string;
}
