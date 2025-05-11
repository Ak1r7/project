import { IsNotEmpty } from 'class-validator';

export class CreateLinkDto {
  readonly link : string;
  readonly userId: number;
 ;
}