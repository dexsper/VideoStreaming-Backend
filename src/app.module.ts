import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from '@lab08/nestjs-s3';

import config from './common/configs/config';
import { S3Config } from './common/configs';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';

import { routes } from './route';
import { ModelsModule } from './models/models.module';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('env') === 'development',
      }),
    }),
    S3Module.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('storage') as S3Config;
      },
    }),
    TagsModule,
    CommentsModule,
    VideosModule,
    ModelsModule,
    UsersModule,
    AuthModule,
    RbacModule,
    RouterModule.register(routes),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
