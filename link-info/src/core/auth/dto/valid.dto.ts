import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
