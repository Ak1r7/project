import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class ValidDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly sub: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
