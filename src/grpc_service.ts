import Knex from 'knex';
import Logger from '@danielemeryau/logger';

import { GrpcTypes, GrpcPackaging } from '@teamest/internal-season-common';

import InternalSeasonService from './service';

export default class InternalSeasonGrpcService {
  service: InternalSeasonService;

  constructor(knex: Knex, logger: Logger) {
    this.service = new InternalSeasonService(knex, logger);
  }

  async updateTeamSeason(
    request: GrpcTypes.UpdateTeamSeasonRequest,
    metadata: any,
  ): Promise<GrpcTypes.UpdateTeamSeasonResponse> {
    const unpackaged = GrpcPackaging.unpackageUpdateTeamSeasonRequest(request);

    const result = await this.service.updateTeamSeason(unpackaged);

    const packagedResult = GrpcPackaging.packageUpdateTeamSeasonResponse(result);

    return packagedResult;
  }

  async destroy() {
    await this.service.destroy();
  }
}
