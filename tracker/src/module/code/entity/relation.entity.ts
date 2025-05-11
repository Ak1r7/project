import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'relation_file_to_code' })
export class RelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true })
  codes: string[];
}
