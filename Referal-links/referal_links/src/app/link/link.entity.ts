import { UserEntity } from "@app/app/user/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'link' })
export class LinkEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  link: string;

  @OneToOne(() => UserEntity, user => user.link)
  @JoinColumn()
  user: UserEntity;
  
  
}
