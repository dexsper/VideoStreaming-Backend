import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VideoEntity } from '../videos/video.entity';
import { UserEntity } from '../users/user.entity';

export interface Comment {
  id: number;
  text: string;
  isApproved: boolean;

  createdDate: Date;
  updatedDate: Date;
}

@Entity('video_comments')
export class CommentEntity implements Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  isApproved: boolean;

  @JoinColumn({ name: 'videoId' })
  @ManyToOne(() => VideoEntity, (video) => video.comments, {
    onDelete: 'CASCADE',
  })
  video: VideoEntity;

  @Column()
  videoId: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column()
  userId: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdDate: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    select: false,
  })
  updatedDate: Date;
}
