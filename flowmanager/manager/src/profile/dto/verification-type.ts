import { Field,  ObjectType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@ObjectType()
export class VerifycationType {
    
    
    @Field()
    code_input:number;

    
}
