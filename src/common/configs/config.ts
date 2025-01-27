import * as env from 'env-var';
import type { Config } from './interface';

export default (): Config => {
  return {
    env: env
      .get('NODE_ENV')
      .default('development')
      .asEnum(['development', 'production']),
    database: {
      type: 'postgres',
      logging: env.get('DB_LOGGING').default(0).asBool(),
      host: env.get('DB_HOST').required().asString(),
      port: env.get('DB_PORT').required().asPortNumber(),
      username: env.get('DB_USER').required().asString(),
      password: env.get('DB_PASSWORD').asString(),
      database: env.get('DB_DATABASE').required().asString(),
    },
    nest: {
      port: env.get('PORT').default(3001).asPortNumber(),
      cors: env.get('CORS').default(1).asBool(),
    },
    swagger: {
      enabled: env.get('SWAGGER_ENABLED').default(0).asBool(),
      title: 'Task-board backend',
      description: 'The api description',
      version: '1.0',
      path: env.get('SWAGGER_URL').default('docs').asString(),
    },
    auth: {
      jwtSecret: env.get('AUTH_JWT_SECRET').required().asString(),
    },
    storage: {
      region: env.get('S3_REGION').required().asString(),
      accessKeyId: env.get('S3_ACCESS_KEY').required().asString(),
      secretAccessKey: env.get('S3_SECRET_KEY').required().asString(),
      video_bucket: env.get('S3_VIDEO_BUCKET').required().asString(),
      output_bucket: env.get('S3_OUTPUT_BUCKET').required().asString(),
    },
  };
};
