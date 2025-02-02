import { Routes } from '@nestjs/core/router/interfaces';

import { VideosModule } from './videos/videos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ModelsModule } from './models/models.module';
import { CommentsModule } from './comments/comments.module';
import { TagsModule } from './tags/tags.module';

export const routes: Routes = [
  {
    path: 'auth',
    module: AuthModule,
  },
  {
    path: 'users',
    module: UsersModule,
  },
  {
    path: 'models',
    module: ModelsModule,
  },
  {
    path: 'videos',
    module: VideosModule,
    children: [
      {
        path: 'tags',
        module: TagsModule,
      },
      {
        path: 'comments',
        module: CommentsModule,
      },
    ],
  },
];
