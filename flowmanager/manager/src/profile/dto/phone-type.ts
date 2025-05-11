import { Field,  ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";

@ObjectType()
export class PhoneType {
    
    
    @IsPhoneNumber()
    @Field()
    phone:string;

}
