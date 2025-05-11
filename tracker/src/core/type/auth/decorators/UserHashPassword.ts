import { UserEntity } from 'src/module/entity/user.entity';

export type UserHasdPassword = Omit<
  UserEntity,
  'password' | 'hashPassword'
> | null;
