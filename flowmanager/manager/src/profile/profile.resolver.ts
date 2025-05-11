import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PhoneType } from './dto/phone-type';
import { ProfileService } from './profile.service';
import { PhoneInput } from './input/phone.input';
import { ObjectId } from 'mongoose';
import { VerifycationType } from './dto/verification-type';
import { CodeInput } from './input/code.input';
import { CodeType } from './dto/code-type';
import { ThemeType } from './dto/theme-type';
import { ThemeInput } from './input/theme.imput';
import { ProfileType } from './dto/profile-type';
import { NameInput } from './input/name.input';
import { DateInput } from './input/date.input';
import { GenderInput } from './input/gender.input';
import { NameType } from './dto/name-type';
import { DateType } from './dto/date-type';
import { GenderType } from './dto/gender-type';
import { NullType } from './dto/null-type';

@Resolver()
export class ProfileResolver {
    constructor(private readonly profileService: ProfileService) {}
    @Query(()=> [CodeType])
    async code(
        @Args('_id',{type:()=> String}) _id: ObjectId, code:CodeType){
            return this.profileService.code(_id,code)
    }

    @Query(()=>[ProfileType])
    async profile(
        @Args('_id',{type:()=> String}) _id: ObjectId,prof:ProfileType){
            return this.profileService.getProfile(_id,prof);
    }
    @Query(()=> NullType)
    async complete(@Args('_id',{type:()=> String}) _id: ObjectId){
        return this.profileService.notcomplete(_id);
    }

    @Mutation(()=>[PhoneType])
    async create(@Args('input') input:PhoneInput){
        return this.profileService.createProfile(input);
        
    }

    @Mutation(()=>[VerifycationType])
    async verification( 
        @Args('_id',{type:()=> String}) _id: ObjectId,
        @Args('code') code: CodeInput){
            return this.profileService.verify(_id,code);        
    }

    @Mutation(()=>[NameType])
    async addName(
        @Args('_id',{type:()=> String}) _id: ObjectId,
        @Args('input') input:NameInput){
        return this.profileService.names(_id,input);
        
    }
    @Mutation(()=>[DateType])
    async addDate(
        @Args('_id',{type:()=> String}) _id: ObjectId,
        @Args('input') input:DateInput){
        return this.profileService.dates(_id,input);
        
    }

    @Mutation(()=>[GenderType])
    async addGender(
        @Args('_id',{type:()=> String}) _id: ObjectId,
        @Args('input') input:GenderInput){
        return this.profileService.genders(_id,input);
        
    }

    @Mutation(()=>[ThemeType])
    async theme(
        @Args('_id',{type:()=> String}) _id: ObjectId,
        @Args('theme') theme: ThemeInput){
            return this.profileService.createTheme(_id,theme);
    
    }

    
}