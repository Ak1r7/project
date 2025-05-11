import { Field,  ObjectType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@ObjectType()
export class CodeType {
    
    
    @Field()
    verify_code:number;

    
}
