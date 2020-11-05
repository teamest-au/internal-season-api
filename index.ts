import Knex from 'knex';
import Logger from '@danielemeryau/logger';

import { ProcessManager } from '@teamest/process-manager';
import { InternalSeasonServiceServer } from '@teamest/internal-season-server';

import InternalSeasonProcess from './src/InternalSeasonServer';
import InternalSeasonService from './src/InternalSeasonService';
import KnexService from './src/KnexService';

const logger = new Logger('internal-season-api');
const PORT = (process.env.PORT && parseInt(process.env.PORT)) || 9010;
const HEALTH_PORT =
  (process.env.HEALTH_PORT && parseInt(process.env.HEALTH_PORT)) || 9011;

const processManager = new ProcessManager(logger, {
  healthResponseTimeMs: 2000,
  healthPort: HEALTH_PORT,
});
const knexService = new KnexService(logger, {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'internal_season',
  password: process.env.MYSQL_PASS || 'internal_season',
  database: process.env.MYSQL_DATABASE || 'season_data',
});
const internalSeasonProcess = new InternalSeasonProcess(
  knexService,
  logger,
  PORT,
);

processManager.registerService(knexService);
processManager.registerService(internalSeasonProcess);

processManager.start();
