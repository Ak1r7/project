import { IsNotEmpty } from 'class-validator';

export class UpdateDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  content: string;
}
