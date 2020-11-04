import Knex from 'knex';
import Logger from '@danielemeryau/logger';

import { InternalSeasonServiceServer } from '@teamest/internal-season-server';

import InternalSeasonService from './src/service';

const logger = new Logger('internal-season-api');
const PORT = (process.env.PORT && parseInt(process.env.PORT)) || 9010;

async function start() {
  const dbConnection = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'internal_season',
    password: process.env.MYSQL_PASS || 'internal_season',
    database: process.env.MYSQL_DATABASE || 'season_data',
  };
  logger.info(`Connecting to MySql ${dbConnection.user}@${dbConnection.host}`);
  const knex = Knex({
    client: 'mysql2',
    connection: dbConnection,
    migrations: {
      tableName: 'migrations',
    },
  });

  try {
    await knex.raw('select 1+1 as result');
    logger.info('Connected to database successfully');
  } catch (err) {
    logger.error('Error connecting to database', err);
    throw new Error('Error connecting to database');
  }

  const service = new InternalSeasonService(knex, logger);
  const server = new InternalSeasonServiceServer(
    'internal-season-api/server',
    PORT,
    service,
  );

  server.listen();
}

start()
  .then(() => {})
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
