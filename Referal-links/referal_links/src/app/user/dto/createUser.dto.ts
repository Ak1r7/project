import { LinkEntity } from '@app/app/link/link.entity';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { JoinColumn, OneToOne } from 'typeorm';

export class CreateUserDto {
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;

  @IsNotEmpty()
  readonly link: number
}