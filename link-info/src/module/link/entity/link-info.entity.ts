import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LinkEntity } from './link.entity';

@Entity({ name: 'link-info' })
export class LinkInfoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true })
  record: string[];

  @Column({ name: 'link_id' })
  linkId: string;

  @OneToOne(
    () => {
      return LinkEntity;
    },
    (link) => {
      return link.id;
    },
  )
  @JoinColumn({ name: 'link_id' })
  link: LinkEntity;
}
