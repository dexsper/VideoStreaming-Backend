import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { ObjectsService } from '@lab08/nestjs-s3';

import { IPagination } from '../common/pagination';
import { translate } from '../common/localization';

import { Model, ModelEntity, ModelTranslationEntity } from './model.entity';
import { CreateModelDto } from './models.dto';

@Injectable()
export class ModelsService {
  private readonly _bucketName: string;

  constructor(
    @InjectRepository(ModelEntity)
    private readonly _modelsRepository: Repository<ModelEntity>,
    private readonly _objectsService: ObjectsService,
    private readonly _configService: ConfigService,
  ) {
    this._bucketName = _configService.get('storage.output_bucket');
  }

  async create(createDto: CreateModelDto) {
    await this._modelsRepository.manager.transaction(async (manager) => {
      const remoteFilename = `models/${Date.now().toString()}_${createDto.image.originalname}`;

      await this._objectsService.putObject(
        this._bucketName,
        createDto.image.buffer,
        remoteFilename,
        {},
      );

      const newModel = manager.create(ModelEntity, {
        image: remoteFilename,
      });

      const savedModel = await manager.save(newModel);
      const translations = Object.entries(createDto.translations).map(
        ([languageCode, translation]) => {
          return manager.create(ModelTranslationEntity, {
            languageCode,
            name: translation.name,
            base: savedModel,
          });
        },
      );

      await manager.save(translations);
    });
  }

  async getAll(
    lang: string,
    page: number,
    search?: string,
  ): Promise<IPagination<Model>> {
    const limit = 12;
    const offset = 12 * page;

    const queryBuilder = this._modelsRepository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.translations', 'translation')
      .where('translation.languageCode = :lang', { lang });

    if (search) {
      queryBuilder.andWhere('translation.name ILIKE :searchText', {
        searchText: `%${search}%`,
      });
    }

    const results = await queryBuilder
      .take(limit + 1)
      .skip(offset)
      .getMany();

    const hasNextPage = results.length > limit;
    if (hasNextPage) {
      results.pop();
    }

    return {
      results: results.map((modelEntity) => translate<Model>(modelEntity)),
      hasNextPage,
    };
  }

  async getById(id: number, lang: string): Promise<Model>;
  async getById(id: number, lang?: undefined): Promise<ModelEntity>;
  async getById(id: number, lang?: string): Promise<ModelEntity | Model> {
    // noinspection TypeScriptValidateTypes
    const model = await this._modelsRepository.findOne({
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
      throw new NotFoundException(`Model with ID ${id} not found`);
    }

    if (lang) {
      return translate<Model>(model);
    }

    return model;
  }
}
