import { LinkEntity } from 'src/module/link/entity/link.entity';
import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractResourse } from '../../../common/abstract/abstract-resource';

@Entity({ name: 'user' })
export class UserEntity extends AbstractResourse {
  @Column({ type: 'varchar', length: 60 })
  email: string;

  @Column({ type: 'varchar', length: 60 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @OneToMany(
    () => {
      return LinkEntity;
    },
    (links) => {
      return links.userId;
    },
  )
  link: LinkEntity;
}
