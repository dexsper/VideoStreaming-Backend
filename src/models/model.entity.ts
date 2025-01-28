import {
  Column,
  CreateDateColumn,
  Entity,
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

export interface Model {
  id: number;
  name: LocaleString;
  image: string;

  createdDate: Date;
  updatedDate: Date;
}

@Entity('models')
export class ModelEntity implements Translatable<Model> {
  @PrimaryGeneratedColumn() id: number;

  @Column() image: string;

  @CreateDateColumn({ select: false })
  createdDate: Date;

  @UpdateDateColumn({ select: false })
  updatedDate: Date;

  @OneToMany(() => ModelTranslationEntity, (translation) => translation.base)
  translations: ModelTranslationEntity[];

  @OneToMany(() => VideoEntity, (video) => video.model)
  videos: VideoEntity[];
}

@Entity('model_translations')
export class ModelTranslationEntity implements Translation<Model> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  languageCode: string;

  @ManyToOne(() => ModelEntity, (base) => base.translations, {
    onDelete: 'CASCADE',
  })
  base: ModelEntity;
}
