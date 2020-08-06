import Knex from 'knex';
import Logger from '@danielemeryau/logger';

import { GrpcTypes } from '@teamest/internal-season-common';

import InternalSeasonService from './service';
import {
  unpackageTeamSeason,
  packageUpdateTeamSeasonResult,
} from '@teamest/internal-season-common/dist/src/grpc_packaging';

export default class InternalSeasonGrpcService {
  service: InternalSeasonService;

  constructor(knex: Knex, logger: Logger) {
    this.service = new InternalSeasonService(knex, logger);
  }

  async updateTeamSeason(
    teamSeason: GrpcTypes.TeamSeason,
    metadata: any,
  ): Promise<GrpcTypes.UpdateTeamSeasonResult> {
    const unpackaged = unpackageTeamSeason(teamSeason);

    const result = await this.service.updateTeamSeason(unpackaged);

    const packagedResult = packageUpdateTeamSeasonResult(result);

    return packagedResult;
  }

  async destroy() {
    await this.service.destroy();
  }
}
