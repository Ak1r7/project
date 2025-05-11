import { ArrayMaxSize, IsNotEmpty } from 'class-validator';

export class ChatDto {
  @IsNotEmpty()
  @ArrayMaxSize(1)
  to: string[];

  @IsNotEmpty()
  message: string;
}
