import { Field,  ObjectType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@ObjectType()
export class ProfileType {
    
    @Field({nullable:true})
    firstName:string;
    
    
    @Field({nullable:true})
    lastName:string;

    
    @Field({nullable:false})
    phone:string;

    @Field({nullable:true})
    dateOfBirth: Date;

    @Field({nullable:true})
    gender: string;

    
    @Field({nullable:false})
    theme:string;

}
