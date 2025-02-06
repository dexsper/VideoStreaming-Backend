import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectsService } from '@lab08/nestjs-s3';
import { Repository } from 'typeorm';

import { translate } from '../common/localization';

import { CreateBannerDto } from './banner.dto';
import BannerEntity, { Banner, BannerTranslationEntity } from './banner.entity';

@Injectable()
export class BannersService {
  private readonly _bucketName: string;

  constructor(
    @InjectRepository(BannerEntity)
    private readonly _bannersRepository: Repository<BannerEntity>,
    private readonly _objectsService: ObjectsService,
    private readonly _configService: ConfigService,
  ) {
    this._bucketName = _configService.get('storage.output_bucket');
  }

  async create(createDto: CreateBannerDto) {
    await this._bannersRepository.manager.transaction(async (manager) => {
      const remoteFilename = `banners/${Date.now().toString()}_${createDto.image.originalname}`;

      await this._objectsService.putObject(
        this._bucketName,
        createDto.image.buffer,
        remoteFilename,
        {},
      );

      const newModel = manager.create(BannerEntity, {
        image: remoteFilename,
        link: createDto.link,
      });

      const savedModel = await manager.save(newModel);
      const translations = Object.entries(createDto.translations).map(
        ([languageCode, translation]) => {
          return manager.create(BannerTranslationEntity, {
            languageCode,
            name: translation.name,
            base: savedModel,
          });
        },
      );

      await manager.save(translations);
    });
  }

  async getAll(lang: string) {
    const queryBuilder = this._bannersRepository
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.translations', 'translation')
      .where('translation.languageCode = :lang', { lang });

    const results = await queryBuilder.getMany();

    return {
      results: results.map((banner) => translate<Banner>(banner)),
    };
  }
}
