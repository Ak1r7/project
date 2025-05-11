import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'relation_task_to_file' })
export class RelationTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true })
  file: string[];
}
