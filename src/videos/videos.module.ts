import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ModelsModule } from '../models/models.module';

import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import {
  VideoEntity,
  VideoTranslationEntity,
  VideoViewEntity,
} from './video.entity';

@Module({
  imports: [
    ModelsModule,
    TypeOrmModule.forFeature([
      VideoEntity,
      VideoTranslationEntity,
      VideoViewEntity,
    ]),
  ],
  providers: [VideosService],
  controllers: [VideosController],
  exports: [VideosService],
})
export class VideosModule {}
