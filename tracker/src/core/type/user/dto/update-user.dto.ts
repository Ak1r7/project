import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  readonly firstName?: string;

  @ApiProperty()
  @IsOptional()
  readonly lastName?: string;

  @IsOptional()
  avatarUrl?: string;
}
