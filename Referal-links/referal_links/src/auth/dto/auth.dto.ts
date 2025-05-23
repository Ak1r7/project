import { IsNotEmpty } from 'class-validator';
export class AuthDto{
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  readonly password: string;
}
