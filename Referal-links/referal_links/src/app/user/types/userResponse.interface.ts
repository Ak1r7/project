import { UserType } from './user.type';

export interface UserResponsInterface {
  user: UserType & { token: string };
}
