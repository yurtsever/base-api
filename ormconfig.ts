import { config } from 'dotenv';
config({ path: ['.env', '.env.local'] });

import { dataSourceOptions } from './src/shared/infrastructure/config/database.config';
import { DataSource } from 'typeorm';

export default new DataSource(dataSourceOptions);
