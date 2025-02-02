import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pagination } from '../common/paginate';
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
    await this._tagsRepository.manager.transaction(async (manager) => {
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
    });
  }

  async getAll(lang: string, page: number, search?: string) {
    const queryBuilder = this._tagsRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.translations', 'translation')
      .where('translation.languageCode = :lang', { lang });

    if (search) {
      queryBuilder.andWhere('translation.text ILIKE :searchText', {
        searchText: `%${search}%`,
      });
    }

    const [results, total] = await queryBuilder
      .take(100)
      .skip(100 * page)
      .getManyAndCount();

    return new Pagination<Tag>({
      results: results.map((modelEntity) => translate<Tag>(modelEntity)),
      total,
    });
  }

  async getById(id: number, lang: string): Promise<Tag>;
  async getById(id: number, lang?: undefined): Promise<TagEntity>;
  async getById(id: number, lang?: string): Promise<TagEntity | Tag> {
    // noinspection TypeScriptValidateTypes
    const model = await this._tagsRepository.findOne({
      relations: {
        translations: !!lang,
      },
      relationLoadStrategy: 'join',
      where: {
        id,
        ...(lang ? { translations: { languageCode: lang } } : {}),
      },
    });

    if (!model) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    if (lang) {
      return translate<Tag>(model);
    }

    return model;
  }
}
