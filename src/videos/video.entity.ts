import {
  LocaleString,
  Translatable,
  Translation,
} from '../common/localization';

import { ModelEntity } from '../models/model.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CommentEntity } from '../comments/comment.entity';
import { TagEntity } from '../tags/tag.entity';

export interface Video {
  id: number;
  name: LocaleString;
  description: LocaleString;
  playlist_file: string;

  createdDate: Date;
  updatedDate: Date;
}

@Entity('videos')
export class VideoEntity implements Translatable<Video> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  length: number;

  @Column()
  playlist_file: string;

  @ManyToOne(() => ModelEntity, (model) => model.videos)
  model: ModelEntity;

  @OneToMany(() => VideoTranslationEntity, (translation) => translation.base)
  translations: VideoTranslationEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.video)
  comments: CommentEntity[];

  @ManyToMany(() => TagEntity)
  @JoinTable({
    name: 'videos_to_tags',
  })
  tags: TagEntity[];

  @CreateDateColumn({ select: false })
  createdDate: Date;

  @UpdateDateColumn({ select: false })
  updatedDate: Date;
}

@Entity('video_translations')
export class VideoTranslationEntity implements Translation<Video> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  @Index()
  languageCode: string;

  @ManyToOne(() => VideoEntity, (base) => base.translations, {
    onDelete: 'CASCADE',
  })
  base: VideoEntity;
}
