import { UserEntity } from 'src/module/user/user.entity';

export type UserType = Omit<UserEntity, 'hashPassword'>;
