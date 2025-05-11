import { hash } from 'bcrypt';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @Column({
    default: '',
    name: 'avatar_url',
  })
  avatarUrl: string;

  @Column({ name: 'activate_at', nullable: true })
  activiteAt: Date;

  @Column({ name: 'socket_id', nullable: true })
  socketId: string;
}
