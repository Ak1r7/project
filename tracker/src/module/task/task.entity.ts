import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RelationTaskEntity } from './relation.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'task' })
export class TaskEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'task_name' })
  taskName: string;

  @ApiProperty()
  @Column({ name: 'task_description' })
  taskDescription: string;

  @ApiProperty()
  @Column({ name: 'assigned_users', nullable: true })
  assignedUsers: string;

  @ApiProperty()
  @Column({ name: 'created_task_user' })
  createdTaskUser: string;

  @ApiProperty()
  @Column({ name: 'closed_task_user', nullable: true })
  closedTaskUser: string;

  @ApiProperty()
  @Column({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty()
  @Column({ name: 'task_status' })
  taskStatus: boolean;

  @ApiProperty()
  @Column({ name: 'closed_at', nullable: true })
  closedAt: Date;

  @ApiProperty()
  @Column('text', { nullable: true, array: true })
  comments: string[];

  @ApiProperty()
  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @ApiProperty()
  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ApiProperty()
  @OneToOne(() => RelationTaskEntity, (file) => file.id)
  @JoinColumn()
  taskFile: RelationTaskEntity;
}
