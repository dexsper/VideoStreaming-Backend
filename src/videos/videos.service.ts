import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectsService } from '@lab08/nestjs-s3';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { translate } from '../common/localization';
import { Pagination } from '../common/paginate';

import { ModelsService } from '../models/models.service';

import { CreateVideoDto } from './video.dto';
import { Video, VideoEntity, VideoTranslationEntity } from './video.entity';

@Injectable()
export class VideosService {
  private readonly _bucketName: string;

  constructor(
    @InjectRepository(VideoEntity)
    private readonly _videosRepository: Repository<VideoEntity>,
    private readonly _modelsService: ModelsService,
    private readonly _objectsService: ObjectsService,
    private readonly _configService: ConfigService,
  ) {
    this._bucketName = _configService.get('storage.video_bucket');
  }

  async create(createDto: CreateVideoDto) {
    const model = await this._modelsService.findById(createDto.modelId);

    const remoteFilename = `${Date.now().toString()}_${createDto.file.originalname}`;
    await this._objectsService.putObject(
      this._bucketName,
      createDto.file.buffer,
      remoteFilename,
      {},
    );

    await this._videosRepository.manager.transaction(async (manager) => {
      const newVideo = manager.create(VideoEntity, {
        playlist: remoteFilename,
        model: model,
      });

      const savedVideo = await manager.save(newVideo);
      const translations = Object.entries(createDto.translations).map(
        ([languageCode, translation]) => {
          return manager.create(VideoTranslationEntity, {
            languageCode,
            name: translation.name,
            description: translation.description,
            base: savedVideo,
          });
        },
      );

      await manager.save(translations);
    });
  }

  async getAll(languageCode: string, page: number) {
    // noinspection TypeScriptValidateTypes
    const [results, total] = await this._videosRepository.findAndCount({
      relations: {
        translations: true,
      },
      relationLoadStrategy: 'join',
      where: {
        translations: {
          languageCode: languageCode,
        },
      },
      take: 12,
      skip: 12 * page,
    });

    return new Pagination<Video>({
      results: results.map((productEntity) => translate<Video>(productEntity)),
      total,
    });
  }
}
