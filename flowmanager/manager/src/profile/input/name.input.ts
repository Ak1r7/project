import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class NameInput{

    @Field()
    firstName: string;

    
    @Field()
    lastName: string;
}