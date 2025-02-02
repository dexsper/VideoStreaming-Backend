import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TagEntity, TagTranslationEntity } from './tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity, TagTranslationEntity])],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
