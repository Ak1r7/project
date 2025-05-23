import { IsNotEmpty } from 'class-validator';

export class RoomDto {
  @IsNotEmpty()
  room: string;
}
