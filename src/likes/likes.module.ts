import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideosModule } from '../videos/videos.module';

import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { LikeEntity } from './like.entity';

@Module({
  imports: [VideosModule, TypeOrmModule.forFeature([LikeEntity])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
