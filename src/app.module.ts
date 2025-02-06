import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from '@lab08/nestjs-s3';

import config from './common/configs/config';
import { S3Config } from './common/configs';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';

import { ModelsModule } from './models/models.module';
import { VideosModule } from './videos/videos.module';
import { CommentsModule } from './comments/comments.module';
import { TagsModule } from './tags/tags.module';
import { LikesModule } from './likes/likes.module';
import { BannersModule } from './banners/banners.module';

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
        cache: true,
        logging: false,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    S3Module.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('storage') as S3Config;
      },
    }),
    CommentsModule,
    TagsModule,
    LikesModule,
    ModelsModule,
    VideosModule,
    UsersModule,
    AuthModule,
    RbacModule,
    BannersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
