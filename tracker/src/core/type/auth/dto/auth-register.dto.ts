import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';
export class AuthRegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly password: string;
}
