import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import BannerEntity, { BannerTranslationEntity } from './banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BannerEntity, BannerTranslationEntity])],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
