import { IsOptional } from 'class-validator';

export class PaginationDTO {
  @IsOptional()
  skip: number;

  @IsOptional()
  limit: number;
}
