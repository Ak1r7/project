import { Field,  ObjectType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@ObjectType()
export class ThemeType {
    
    
    @Field()
    theme:string;

}
