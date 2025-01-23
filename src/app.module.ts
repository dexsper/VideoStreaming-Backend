import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from './common/configs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';

import { routes } from './route';

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
    UsersModule,
    AuthModule,
    RbacModule,
    RouterModule.register(routes),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
