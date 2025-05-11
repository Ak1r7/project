import { Field,  InputType} from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";


@InputType()
export class CodeInput {
    
    @Field()
    code_input:number;
}
