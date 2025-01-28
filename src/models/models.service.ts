import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { ObjectsService } from '@lab08/nestjs-s3';

import { translate } from '../common/localization';
import { Pagination } from '../common/paginate';

import { Model, ModelEntity, ModelTranslationEntity } from './model.entity';
import { CreateModelDto } from './models.dto';

@Injectable()
export class ModelsService {
  private readonly _bucketName: string;

  constructor(
    @InjectRepository(ModelEntity)
    private readonly modelsRepository: Repository<ModelEntity>,
    private readonly _objectsService: ObjectsService,
    private readonly _configService: ConfigService,
  ) {
    this._bucketName = _configService.get('storage.output_bucket');
  }

  async create(createDto: CreateModelDto) {
    await this.modelsRepository.manager.transaction(async (manager) => {
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

  async getAll(lang: string, page: number, search?: string) {
    const queryBuilder = this.modelsRepository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.translations', 'translation')
      .where('translation.languageCode = :lang', { lang });

    if (search) {
      queryBuilder.andWhere('translation.name ILIKE :searchText', {
        searchText: `%${search}%`,
      });
    }

    const [results, total] = await queryBuilder
      .take(12)
      .skip(12 * page)
      .getManyAndCount();

    return new Pagination<Model>({
      results: results.map((modelEntity) => translate<Model>(modelEntity)),
      total,
    });
  }

  async findById(id: number, lang: string): Promise<Model>;
  async findById(id: number, lang?: undefined): Promise<ModelEntity>;
  async findById(id: number, lang?: string): Promise<ModelEntity | Model> {
    // noinspection TypeScriptValidateTypes
    const model = await this.modelsRepository.findOne({
      relations: {
        translations: !!lang,
      },
      relationLoadStrategy: 'join',
      where: {
        id,
        translations: {
          languageCode: lang,
        },
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
