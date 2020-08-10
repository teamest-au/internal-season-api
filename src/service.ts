import Knex from 'knex';
import Logger from '@danielemeryau/logger';
import deepEqual from 'fast-deep-equal';
import { v4 as uuidv4 } from 'uuid';

import { Event } from '@teamest/models/raw';
import { RawJSONSerialisers } from '@teamest/models/helpers';
import { ServiceTypes } from '@teamest/internal-season-common';

import * as DataTypes from './data.types';

export function eventDataHasChanged(
  existing: Event[],
  current: Event[],
): boolean {
  return !deepEqual(existing, current);
}

export default class InternalSeasonService {
  private knex: Knex;
  private logger: Logger;

  constructor(knex: Knex, logger: Logger) {
    this.knex = knex;
    this.logger = logger;
  }

  async updateTeamSeason(
    request: ServiceTypes.UpdateTeamSeasonRequest,
  ): Promise<ServiceTypes.UpdateTeamSeasonResponse> {
    let result: ServiceTypes.UpdateTeamSeasonResponse;
    const { teamSeason } = request;
    const {
      competitionName: receivedCompetitionName,
      seasonName: receivedSeasonName,
      teamName: recievedTeamName,
      events: receivedEvents,
      lastScraped: receivedLastScraped,
    } = teamSeason;

    const trx = await this.knex.transaction();
    try {
      const existing = await trx
        .select<DataTypes.TeamSeason>('team_season_id')
        .from('team_season')
        .where({
          season_name: receivedSeasonName,
          team_name: recievedTeamName,
          competition_name: receivedCompetitionName,
        })
        .first();

      if (existing) {
        this.logger.info(`Team season exists`, {
          id: existing.team_season_id,
          competitionName: receivedCompetitionName,
          teamName: recievedTeamName,
          seasonName: receivedSeasonName,
        });
        const latestVersionEvents = await trx
          .select<DataTypes.TeamSeasonVersion>(
            'team_season_version_id',
            'events',
          )
          .from('team_season_version')
          .where({ team_season_id: existing.team_season_id })
          .orderBy('last_scraped', 'desc')
          .first();

        if (!latestVersionEvents) {
          throw new Error(
            'team_season exists without any team_season_version entries!',
          );
        }

        console.log(latestVersionEvents);

        const deserialisedLatestEvents = latestVersionEvents.events.map(
          event => RawJSONSerialisers.deserialiseEvent(JSON.stringify(event)),
        );

        this.logger.debug('Diffing existing events against recieved', {
          deserialisedLatestEvents,
          receivedEvents,
        });
        if (eventDataHasChanged(deserialisedLatestEvents, receivedEvents)) {
          this.logger.info('Events have changed, updating.', {
            competitionName: receivedCompetitionName,
            teamName: recievedTeamName,
            seasonName: receivedSeasonName,
          });
          await trx('team_season_version').insert<DataTypes.TeamSeasonVersion>({
            team_season_version_id: uuidv4(),
            team_season_id: existing.team_season_id,
            events: `[${receivedEvents
              .map(RawJSONSerialisers.serialiseEvent)
              .join(',')}]`,
            first_scraped: receivedLastScraped,
            last_scraped: receivedLastScraped,
          });
          result = {
            teamSeasonId: existing.team_season_id,
            competitionName: receivedCompetitionName,
            seasonName: receivedSeasonName,
            teamName: recievedTeamName,
            wasModified: true,
          };
        } else {
          this.logger.info('Events are unchanged , updating last_scraped', {
            competitionName: receivedCompetitionName,
            teamName: recievedTeamName,
            seasonName: receivedSeasonName,
          });
          await trx('team_season_version')
            .where({
              team_season_version_id:
                latestVersionEvents.team_season_version_id,
            })
            .update<DataTypes.TeamSeasonVersion>({
              last_scraped: receivedLastScraped,
            });
          result = {
            teamSeasonId: existing.team_season_id,
            competitionName: receivedCompetitionName,
            seasonName: receivedSeasonName,
            teamName: recievedTeamName,
            wasModified: false,
          };
        }
      } else {
        this.logger.info(
          "Team season doesn't exist, inserting with latest events",
          {
            competitionName: receivedCompetitionName,
            teamName: recievedTeamName,
            seasonName: receivedSeasonName,
          },
        );

        const teamSeasonId = uuidv4();
        await trx('team_season').insert<DataTypes.TeamSeason>({
          competition_name: receivedCompetitionName,
          team_season_id: teamSeasonId,
          season_name: receivedSeasonName,
          team_name: recievedTeamName,
        });
        await trx('team_season_version').insert<DataTypes.TeamSeasonVersion>({
          team_season_version_id: uuidv4(),
          team_season_id: teamSeasonId,
          events: JSON.stringify(receivedEvents),
          first_scraped: receivedLastScraped,
          last_scraped: receivedLastScraped,
        });
        result = {
          teamSeasonId,
          competitionName: receivedCompetitionName,
          seasonName: receivedSeasonName,
          teamName: recievedTeamName,
          wasModified: true,
        };
      }

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }

    return result;
  }

  async destroy() {
    await this.knex.destroy();
  }
}
