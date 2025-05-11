import { LinkEntity } from '@app/app/link/link.entity';
import { hash } from "bcrypt";
import { BeforeInsert, Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn, PrimaryColumn, ManyToMany, OneToMany } from "typeorm";

@Entity({ name: 'users' })
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @PrimaryColumn()
  username: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  referralCount: number;

  @Column({ default: 0 })
  balance: number;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @OneToOne(() => LinkEntity, link => link.user)
  @JoinColumn() 
  link: LinkEntity;
}
