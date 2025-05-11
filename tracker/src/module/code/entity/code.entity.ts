import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'code' })
export class CodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rowColumn: number;

  @Column()
  code: string;

  @Column({ default: '' })
  comments: string;

  @Column({ default: '', name: ' user_id' })
  userIdComment: string;
}
