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

@Entity('video_likes')
export class LikeEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column()
  isNegative: boolean;

  @JoinColumn({ name: 'videoId' })
  @ManyToOne(() => VideoEntity, (video) => video.likes, {
    onDelete: 'CASCADE',
  })
  video: VideoEntity;

  @Column()
  videoId: number;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (user) => user.likes, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column()
  userId: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    select: false,
  })
  createdDate: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    select: false,
  })
  updatedDate: Date;
}
