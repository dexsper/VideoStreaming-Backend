import { VideosModule } from './videos/videos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ModelsModule } from './models/models.module';

export const routes = [
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
  },
];
