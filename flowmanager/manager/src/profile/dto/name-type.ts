import { Field,  ObjectType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@ObjectType()
export class NameType {
    
    
    @Field()
    firstName: string;

    @Field()
    lastName: string;
    
}
