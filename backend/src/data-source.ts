import { DataSource, DataSourceOptions } from 'typeorm';
import { Image } from './entities/image.entity';

const isTsNode = !!process[Symbol.for('ts-node.register.instance')];

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'opti_view_db',
  entities: [Image],
  migrations: isTsNode
    ? ['src/migrations/**/*.ts']
    : ['dist/migrations/**/*.js'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: ['query', 'error'],
  migrationsRun: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
