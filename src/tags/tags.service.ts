import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { translate } from '../common/localization';

import { Tag, TagEntity, TagTranslationEntity } from './tag.entity';
import { CreateTagDto } from './tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly _tagsRepository: Repository<TagEntity>,
  ) {}

  async create(createDto: CreateTagDto) {
    return await this._tagsRepository.manager.transaction(async (manager) => {
      const newTag = manager.create(TagEntity);
      const savedTag = await manager.save(newTag);

      const translations = Object.entries(createDto.translations).map(
        ([languageCode, translation]) => {
          return manager.create(TagTranslationEntity, {
            languageCode,
            text: translation.text,
            base: savedTag,
          });
        },
      );

      await manager.save(translations);

      return savedTag;
    });
  }

  async getAll(lang: string, search?: string) {
    const queryBuilder = this._tagsRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.translations', 'translation')
      .where('translation.languageCode = :lang', { lang });

    if (search) {
      queryBuilder.andWhere('translation.text ILIKE :searchText', {
        searchText: `%${search}%`,
      });
    }

    const results = await queryBuilder.getMany();

    return {
      results: results.map((modelEntity) => translate<Tag>(modelEntity)),
    };
  }

  async getPopular(lang: string) {
    const results = await this._tagsRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.translations', 'translation')
      .where('translation.languageCode = :lang', { lang })
      .addSelect('COUNT(videos.id) as videosCount')
      .leftJoin('tag.videos', 'videos')
      .groupBy('tag.id, translation.id')
      .orderBy('videosCount', 'DESC')
      .limit(10)
      .cache(`popular-tags-${lang}`, 60 * 1000)
      .getMany();

    return {
      results: results.map((modelEntity) => translate<Tag>(modelEntity)),
    };
  }
}
