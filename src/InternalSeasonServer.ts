import Logger from '@danielemeryau/logger';

import {
  IProcessManagerService,
  IProcessHealth,
  IServiceHealth,
} from '@teamest/process-manager';
import KnexService from './KnexService';
import InternalSeasonService from './InternalSeasonService';
import { InternalSeasonServiceServer } from '@teamest/internal-season-server';

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default class InternalSeasonServer implements IProcessManagerService {
  private knexService: KnexService;
  logger: Logger;
  port: number;

  constructor(knexService: KnexService, logger: Logger, port: number) {
    this.knexService = knexService;
    this.logger = logger;
    this.port = port;
  }

  getName(): string {
    return 'http-rpc-server';
  }
  async getHealth(): Promise<IServiceHealth> {
    return {
      healthy: false,
    };
  }
  async start(): Promise<void> {
    // Wait for knex
    let ready;
    do {
      ready = (await this.knexService.getHealth()).healthy;
      await sleep(2000);
    } while (!ready);

    const knex = this.knexService.getKnex();

    const service = new InternalSeasonService(knex, this.logger);
    const server = new InternalSeasonServiceServer(
      'internal-season-api/server',
      this.port,
      service,
    );

    server.listen();
  }
  stop(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
