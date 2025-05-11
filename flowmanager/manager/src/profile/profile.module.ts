import { Module } from '@nestjs/common';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileSchema } from './profile.schemas';

@Module({
  imports: [MongooseModule.forFeature([{name:'profiles',schema: ProfileSchema}]),],
  providers: [ProfileResolver, ProfileService, ]
})
export class ProfileModule {}
