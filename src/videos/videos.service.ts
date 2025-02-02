import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectsService } from '@lab08/nestjs-s3';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { translate } from '../common/localization';
import { Pagination } from '../common/paginate';

import { TagEntity } from '../tags/tag.entity';
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
    const model = await this._modelsService.getById(createDto.modelId);

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
        tags: createDto.tags.map((tagId) => ({ id: tagId }) as TagEntity),
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

  async getAll(lang: string, page: number, search?: string, tags?: number[]) {
    const queryBuilder = this._videosRepository
      .createQueryBuilder('video')
      .innerJoinAndSelect(
        'video.translations',
        'videoTranslation',
        'videoTranslation.languageCode = :lang',
        { lang },
      )
      .innerJoinAndSelect('video.model', 'model')
      .innerJoinAndSelect(
        'model.translations',
        'modelTranslation',
        'modelTranslation.languageCode = :lang',
        { lang },
      )
      .innerJoinAndSelect('video.tags', 'tag')
      .innerJoinAndSelect(
        'tag.translations',
        'tagTranslation',
        'tagTranslation.languageCode = :lang',
        { lang },
      );

    if (search) {
      queryBuilder.andWhere('videoTranslation.name ILIKE :searchText', {
        searchText: `%${search}%`,
      });
    }

    if (tags?.length) {
      queryBuilder.andWhere(
        (qb) => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from('videos_to_tags', 'vt')
            .where('vt.videosId = video.id')
            .andWhere('vt.videoTagsId IN (:...tags)')
            .getQuery();

          return `EXISTS (${subQuery})`;
        },
        { tags },
      );
    }

    const [results, total] = await queryBuilder
      .take(12)
      .skip(12 * page)
      .getManyAndCount();

    return new Pagination<Video>({
      results: results.map((video) => translate<Video>(video)),
      total,
    });
  }

  async getById(id: number, lang: string): Promise<Video>;
  async getById(id: number, lang?: undefined): Promise<VideoEntity>;
  async getById(id: number, lang?: string): Promise<VideoEntity | Video> {
    // noinspection TypeScriptValidateTypes
    const video = await this._videosRepository.findOne({
      relations: {
        translations: !!lang,
        model: {
          translations: !!lang,
        },
        tags: {
          translations: !!lang,
        },
      },
      relationLoadStrategy: 'join',
      where: {
        id,
        ...(lang && {
          translations: { languageCode: lang },
          model: { translations: { languageCode: lang } },
          tags: { translations: { languageCode: lang } },
        }),
      },
    });

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    if (lang) {
      return translate<Video>(video);
    }

    return video;
  }
}
