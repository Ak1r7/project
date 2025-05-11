import { UserEntity } from 'src/module/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'link' })
export class LinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  link: string;

  @ManyToOne(
    () => {
      return UserEntity;
    },
    (user) => {
      return user.id;
    },
  )
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
