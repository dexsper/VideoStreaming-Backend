import { Injectable, NotFoundException } from '@nestjs/common';
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

  getVideoLength(buffer) {
    const header = Buffer.from('mvhd');
    const start = buffer.indexOf(header) + 16;
    const timeScale = buffer.readUInt32BE(start);
    const duration = buffer.readUInt32BE(start + 4);

    return Math.floor(duration / timeScale);
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
        playlist_file: remoteFilename.split('.')[0],
        model: model,
        length: this.getVideoLength(createDto.file.buffer),
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

  async getAll(lang: string, page: number) {
    // noinspection TypeScriptValidateTypes
    const [results, total] = await this._videosRepository.findAndCount({
      relations: {
        translations: true,
        model: {
          translations: true,
        },
      },
      relationLoadStrategy: 'join',
      where: {
        translations: {
          languageCode: lang,
        },
        model: {
          translations: {
            languageCode: lang,
          },
        },
      },
      take: 12,
      skip: 12 * page,
    });

    return new Pagination<Video>({
      results: results.map((video) => translate<Video>(video)),
      total,
    });
  }

  async getById(lang: string, id: number) {
    // noinspection TypeScriptValidateTypes
    const video = await this._videosRepository.findOne({
      relations: {
        translations: true,
        model: {
          translations: true,
        },
      },
      relationLoadStrategy: 'join',
      where: {
        id,
        translations: {
          languageCode: lang,
        },
        model: {
          translations: {
            languageCode: lang,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    return translate<Video>(video);
  }
}
