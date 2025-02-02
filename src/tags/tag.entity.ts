import {
  Column,
  CreateDateColumn,
  Entity, Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  LocaleString,
  Translatable,
  Translation,
} from '../common/localization';

import { VideoEntity } from '../videos/video.entity';

export interface Tag {
  id: number;
  text: LocaleString;

  createdDate: Date;
  updatedDate: Date;
}

@Entity('video_tags')
export class TagEntity implements Translatable<Tag> {
  @PrimaryGeneratedColumn() id: number;

  @OneToMany(() => TagTranslationEntity, (translation) => translation.base)
  translations: TagTranslationEntity[];

  @ManyToMany(() => VideoEntity, (video) => video.tags)
  videos: VideoEntity[];

  @CreateDateColumn({ select: false })
  createdDate: Date;

  @UpdateDateColumn({ select: false })
  updatedDate: Date;
}

@Entity('video_tag_translations')
export class TagTranslationEntity implements Translation<Tag> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  @Index()
  languageCode: string;

  @ManyToOne(() => TagEntity, (base) => base.translations)
  base: TagEntity;
}
