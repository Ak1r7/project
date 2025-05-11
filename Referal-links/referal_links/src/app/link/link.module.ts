
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { LinkEntity } from './link.entity';
import { UserEntity } from "@app/app/user/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([LinkEntity,UserEntity])],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
