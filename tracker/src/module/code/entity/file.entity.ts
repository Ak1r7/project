import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RelationEntity } from './relation.entity';

@Entity({ name: 'file' })
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'user_id' })
  userId: string;

  @OneToOne(() => RelationEntity, { cascade: true })
  @JoinColumn()
  relation: RelationEntity;
}
