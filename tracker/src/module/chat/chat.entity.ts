import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'chat' })
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column()
  from_user_id: string;

  @Column('uuid', { array: true })
  to_user_id: string[];

  @Column()
  content: string;

  @Column()
  accepted: boolean;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ name: 'seen_at', nullable: true })
  seenAt: Date;

  @Column('text', { array: true, nullable: true })
  file_id: string[];
}
