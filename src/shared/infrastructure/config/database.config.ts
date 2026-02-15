import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export const createDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const databaseUrl = configService.get<string>('database.url');

  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}', __dirname + '/../../../modules/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: configService.get<boolean>('database.synchronize', false),
    logging: configService.get<boolean>('database.logging', false),
    ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : configService.get<boolean>('database.ssl', false),
    extra: {
      max: configService.get<number>('database.maxConnections', 10),
      min: configService.get<number>('database.minConnections', 2),
    },
  };

  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,
    };
  }

  return {
    ...baseConfig,
    host: configService.get<string>('database.host', 'localhost'),
    port: configService.get<number>('database.port', 5432),
    username: configService.get<string>('database.username', 'postgres'),
    password: configService.get<string>('database.password', 'postgres'),
    database: configService.get<string>('database.database', 'base_api'),
  };
};

// DataSource for TypeORM CLI
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DATABASE_USERNAME || 'postgres'}:${process.env.DATABASE_PASSWORD || 'postgres'}@${process.env.DATABASE_HOST || 'localhost'}:${process.env.DATABASE_PORT || 5432}/${process.env.DATABASE_NAME || 'base_api'}`,
  entities: [__dirname + '/../**/*.entity{.ts,.js}', __dirname + '/../../../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.DATABASE_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
