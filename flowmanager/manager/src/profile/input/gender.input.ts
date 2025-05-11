import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class GenderInput{

    
    @Field()
    gender: string;
}