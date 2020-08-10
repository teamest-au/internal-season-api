import Knex from 'knex';
import Logger from '@danielemeryau/logger';
const grpc = require('@grpc/grpc-js');
const { Server } = require('grpc-server-js');

import { GrpcServices } from '@teamest/internal-season-common';
import service from './src/grpc_service';
import InternalSeasonGrpcService from './src/grpc_service';

const logger = new Logger('internal-season-api');

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

  const service = new InternalSeasonGrpcService(knex, logger);

  const server = new Server();
  server.addService(GrpcServices.SeasonService, {
    updateTeamSeason: function (
      { metadata, request }: any,
      callback: Function,
    ) {
      service
        .updateTeamSeason(request, metadata)
        .then((result) => {
          callback(null, result);
        })
        .catch((err) => {
          callback(err);
        });
    },
    getSeasonsForTeam: function (
      { metadata, request }: any,
      callback: Function,
    ) {
      service
        .getSeasonsForTeam(request, metadata)
        .then((result) => {
          callback(null, result);
        })
        .catch((err) => {
          callback(err);
        });
    },
  });
  const host = `0.0.0.0:${process.env.GRPC_PORT || 50051}`;
  await server.bind(host, grpc.ServerCredentials.createInsecure());
  server.start();
  logger.info(`Grpc Server listening on ${host}`);
}

start()
  .then(() => {})
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
