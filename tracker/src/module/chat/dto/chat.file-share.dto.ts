import { ArrayMaxSize, IsNotEmpty } from 'class-validator';

export class ChatFileShareDto {
  @IsNotEmpty()
  @ArrayMaxSize(5)
  fileId: string[];

  @IsNotEmpty()
  @ArrayMaxSize(5)
  to: string[];

  message: string;
}
