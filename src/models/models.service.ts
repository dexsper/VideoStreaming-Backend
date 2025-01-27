import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ObjectsService } from '@lab08/nestjs-s3';

import { translate } from '../common/localization';
import { Model, ModelEntity, ModelTranslationEntity } from './model.entity';
import { CreateModelDto } from './models.dto';
import { ConfigService } from '@nestjs/config';

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

  async getAll(languageCode: string) {
    // noinspection TypeScriptValidateTypes
    return {
      models: await this.modelsRepository
        .find({
          relations: {
            translations: true,
          },
          relationLoadStrategy: 'join',
          where: {
            translations: {
              languageCode: languageCode,
            },
          },
        })
        .then((result) =>
          result.map((productEntity) => translate<Model>(productEntity)),
        ),
    };
  }

  async findById(id: number): Promise<ModelEntity> {
    const model = await this.modelsRepository.findOneBy({ id });
    if (!model) {
      throw new NotFoundException(`Model with ID ${id} not found`);
    }
    return model;
  }
}
