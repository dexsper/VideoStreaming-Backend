import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectsService } from '@lab08/nestjs-s3';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { IPagination } from '../common/pagination';
import { translate } from '../common/localization';

import { TagEntity } from '../tags/tag.entity';
import { ModelsService } from '../models/models.service';

import { CreateVideoDto } from './video.dto';
import {
  Video,
  VideoEntity,
  VideoTranslationEntity,
  VideoViewEntity,
} from './video.entity';

@Injectable()
export class VideosService {
  private readonly _bucketName: string;

  constructor(
    @InjectRepository(VideoEntity)
    private readonly _videosRepository: Repository<VideoEntity>,
    @InjectRepository(VideoViewEntity)
    private readonly _viewsRepository: Repository<VideoViewEntity>,
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

  async getAll(
    lang: string,
    page: number,
    search?: string,
    tags?: number[],
  ): Promise<IPagination<Video>> {
    const limit = 12;
    const offset = 12 * page;

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
      );

    if (search) {
      queryBuilder.andWhere('videoTranslation.name ILIKE :searchText', {
        searchText: `%${search}%`,
      });
    }

    if (tags?.length) {
      queryBuilder
        .innerJoin('video.tags', 'tag')
        .andWhere('tag.id IN (:...tags)', { tags })
        .groupBy('video.id')
        .having('COUNT(DISTINCT tag.id) = :tagCount', {
          tagCount: tags.length,
        });
    }

    const results = await queryBuilder
      .leftJoin('video.likes', 'likes')
      .addSelect('COUNT(likes.id) as likesCount')
      .groupBy('video.id, videoTranslation.id')
      .addGroupBy('model.id, modelTranslation.id')
      .orderBy('likesCount', 'DESC')
      .limit(limit + 1)
      .offset(offset)
      .cache(30 * 1000)
      .getMany();

    const hasNextPage = results.length > limit;
    if (hasNextPage) {
      results.pop();
    }

    return {
      results: results.map((video) => translate<Video>(video)),
      hasNextPage,
    };
  }

  async getById(id: number, lang: string): Promise<Video>;
  async getById(id: number, lang?: undefined): Promise<VideoEntity>;
  async getById(id: number, lang?: string): Promise<VideoEntity | Video> {
    const queryBuilder = this._videosRepository
      .createQueryBuilder('video')
      .where('video.id = :id', { id: id });

    if (lang) {
      queryBuilder
        .leftJoin('video.likes', 'like')
        .loadRelationCountAndMap('video.likes', 'video.likes', 'likes', (qb) =>
          qb.andWhere('likes.isNegative = false'),
        )
        .loadRelationCountAndMap(
          'video.dislikes',
          'video.likes',
          'dislikes',
          (qb) => qb.andWhere('dislikes.isNegative = true'),
        )
        .loadRelationCountAndMap('video.views', 'video.views', 'views')
        .loadRelationCountAndMap(
          'video.favorites',
          'video.favorites',
          'favorites',
        )
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
    }

    const video = await queryBuilder.getOne();

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    if (lang) {
      return translate<Video>(video);
    }

    return video;
  }

  async view(id: number, userId: number) {
    const existingView = await this._viewsRepository.findOne({
      where: {
        videoId: id,
        userId,
        createdDate: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      },
    });

    if (!existingView) {
      const newView = this._viewsRepository.create({
        videoId: id,
        userId,
      });

      await this._viewsRepository.save(newView);
    }
  }

  async toggleFavourite(id: number, userId: number) {
    const isFavourite = await this._videosRepository
      .createQueryBuilder()
      .relation(VideoEntity, 'favorites')
      .of(id)
      .loadMany();

    const alreadyFavourite = isFavourite.some((user) => user.id === userId);

    if (alreadyFavourite) {
      await this._videosRepository
        .createQueryBuilder()
        .relation(VideoEntity, 'favorites')
        .of(id)
        .remove(userId);
    } else {
      await this._videosRepository
        .createQueryBuilder()
        .relation(VideoEntity, 'favorites')
        .of(id)
        .add(userId);
    }
  }

  async getFavourites(
    lang: string,
    page: number,
    userId: number,
  ): Promise<IPagination<Video>> {
    const limit = 12;
    const offset = 12 * page;

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
      );

    const results = await queryBuilder
      .leftJoin('video.favorites', 'user')
      .where('user.id = :userId', { userId })
      .limit(limit + 1)
      .offset(offset)
      .getMany();

    const hasNextPage = results.length > limit;
    if (hasNextPage) {
      results.pop();
    }

    return {
      results: results.map((video) => translate<Video>(video)),
      hasNextPage,
    };
  }

  async isFavourite(id: number, userId: number) {
    const count = await this._videosRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.favorites', 'user')
      .where('video.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .getCount();

    return count > 0;
  }
}
