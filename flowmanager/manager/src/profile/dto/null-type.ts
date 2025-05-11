import { Field, ObjectType } from "@nestjs/graphql";
import { Profile } from "../profile.schemas";


@ObjectType()
export class NullType {
    @Field(() => [String])
    nullKeys: string[];

    @Field(() => Profile)
    profile: Profile;
}