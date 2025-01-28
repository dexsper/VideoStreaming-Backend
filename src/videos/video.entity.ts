import {
  LocaleString,
  Translatable,
  Translation,
} from '../common/localization';

import { Model, ModelEntity } from '../models/model.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface Video {
  id: number;
  name: LocaleString;
  description: LocaleString;
  playlist: string;

  model: Translatable<Model>;

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
  playlist: string;

  @CreateDateColumn({ select: false })
  createdDate: Date;

  @UpdateDateColumn({ select: false })
  updatedDate: Date;

  @ManyToOne(() => ModelEntity, (model) => model.videos)
  model: ModelEntity;

  @OneToMany(() => VideoTranslationEntity, (translation) => translation.base)
  translations: VideoTranslationEntity[];
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
  languageCode: string;

  @ManyToOne(() => VideoEntity, (base) => base.translations, {
    onDelete: 'CASCADE',
  })
  base: VideoEntity;
}
