import axios from 'axios';
import { Server } from 'http';

import Logger from '@danielemeryau/logger';
import { KnexService } from '@teamest/knex-service';
import { InternalSeasonServiceServer } from '@teamest/internal-season-server';

import { version } from '../package.json';

import {
  IProcessManagerService,
  IServiceHealth,
  IServiceStatus,
  waitUntilReady,
} from '@teamest/process-manager';
import InternalSeasonService from './InternalSeasonService';

export default class InternalSeasonServer implements IProcessManagerService {
  private knexService: KnexService;
  logger: Logger;
  port: number;
  runState: 'stopped' | 'starting' | 'running' | 'stopping';
  statusMessage?: string;
  server?: Server;

  constructor(knexService: KnexService, logger: Logger, port: number) {
    this.knexService = knexService;
    this.logger = logger;
    this.port = port;
    this.runState = 'stopped';
  }

  getName(): string {
    return 'http-rpc-server';
  }

  getStatus(): IServiceStatus {
    return {
      state: this.runState,
      ...(this.statusMessage && { message: this.statusMessage }),
    };
  }

  async getHealth(): Promise<IServiceHealth> {
    try {
      await axios.get(`http://localhost:${this.port}/version`);
      return {
        healthy: 'healthy',
      };
    } catch (err) {
      this.logger.error(err);
      return {
        healthy: 'unhealthy',
      };
    }
  }

  async start(): Promise<void> {
    this.runState = 'starting';
    this.statusMessage = 'waiting for mysql';
    // Wait for knex
    waitUntilReady([this.knexService], 5000, 'healthy').then(() => {
      // Knex ready, start server
      const knex = this.knexService.getInstance();

      const service = new InternalSeasonService(knex, this.logger);
      const server = new InternalSeasonServiceServer(
        service,
        'internal-season-api/server',
        this.port,
        {
          api: `v${version}`,
        },
      );

      server.listen();
      this.statusMessage = undefined;
      this.runState = 'running';
    });
  }

  stop(): Promise<void> {
    this.runState = 'stopped';
    return Promise.resolve();
  }
}
