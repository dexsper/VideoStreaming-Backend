import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { ModelEntity, ModelTranslationEntity } from './model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModelEntity, ModelTranslationEntity])],
  providers: [ModelsService],
  controllers: [ModelsController],
  exports: [ModelsService],
})
export class ModelsModule {}
