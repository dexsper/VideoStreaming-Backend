import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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

export interface Banner {
  id: number;
  link: string;
  name: LocaleString;
  image: string;

  createdDate: Date;
  updatedDate: Date;
}

@Entity('banners')
export default class BannerEntity implements Translatable<Banner> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  link: string;

  @Column()
  image: string;

  @OneToMany(() => BannerTranslationEntity, (translation) => translation.base)
  translations: BannerTranslationEntity[];

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

@Entity('banner_translation')
export class BannerTranslationEntity implements Translation<Banner> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  @Index()
  languageCode: string;

  @ManyToOne(() => BannerEntity, (base) => base.translations, {
    onDelete: 'CASCADE',
  })
  base: BannerEntity;
}
