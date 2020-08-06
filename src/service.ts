import Knex from 'knex';
import Logger from '@danielemeryau/logger';
import deepEqual from 'fast-deep-equal';
import { v4 as uuidv4 } from 'uuid';

import { TeamSeason } from '@teamest/models/processed';
import { Event } from '@teamest/models/raw';
import { RawSerialisers } from '@teamest/models/helpers';
import { ServiceTypes } from '@teamest/internal-season-common';

import * as DataTypes from './data.types';

interface EventData {
  events: Event[];
  timezone: string;
  matchDuration: number;
}

function eventDataHasChanged(existing: EventData, current: EventData): boolean {
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
    teamSeason: TeamSeason,
  ): Promise<ServiceTypes.UpdateTeamSeasonResult> {
    let result: ServiceTypes.UpdateTeamSeasonResult;
    const {
      seasonName: receivedSeasonName,
      teamName: recievedTeamName,
      events: receivedEvents,
      matchDuration: recievedMatchDuration,
      timezone: recievedTimezone,
      timeScraped: receivedTimeScraped,
    } = teamSeason;

    const trx = await this.knex.transaction();
    try {
      const existing = await trx
        .select<DataTypes.TeamSeason>('team_season_id')
        .from('team_season')
        .where({ season_name: receivedSeasonName, team_name: recievedTeamName })
        .first();

      if (existing) {
        this.logger.info(`Team season exists`, {
          id: existing.team_season_id,
          teamName: recievedTeamName,
          seasonName: receivedSeasonName,
        });
        const latestEvents = await trx
          .select<DataTypes.TeamSeasonEvent>(
            'events',
            'event_duration_minutes',
            'timezone',
          )
          .from('team_season_event')
          .where({ team_season_id: existing.team_season_id })
          .orderBy('created_at', 'desc')
          .first();

        if (!latestEvents) {
          throw new Error(
            'team_season exists without any team_season_event entries!',
          );
        }

        const deserialisedLatestEvents = latestEvents.events.map(
          RawSerialisers.deserialiseEvent,
        );

        this.logger.debug('Diffing existing events against recieved', {
          deserialisedLatestEvents,
          receivedEvents,
        });
        if (
          eventDataHasChanged(
            {
              events: deserialisedLatestEvents,
              matchDuration: latestEvents.event_duration_minutes,
              timezone: latestEvents.timezone,
            },
            {
              events: receivedEvents,
              matchDuration: recievedMatchDuration,
              timezone: recievedTimezone,
            },
          )
        ) {
          this.logger.info('Events have changed, updating.', {
            teamName: recievedTeamName,
            seasonName: receivedSeasonName,
          });
          await trx('team_season_event').insert<DataTypes.TeamSeasonEvent>({
            team_season_event_id: uuidv4(),
            team_season_id: existing.team_season_id,
            events: JSON.stringify(receivedEvents),
            event_duration_minutes: recievedMatchDuration,
            timezone: recievedTimezone,
            scraped_at: receivedTimeScraped,
          });
          result = {
            teamSeasonId: existing.team_season_id,
            seasonName: receivedSeasonName,
            teamName: recievedTeamName,
            wasModified: true,
          };
        } else {
          this.logger.info('Events are unchanged.', {
            teamName: recievedTeamName,
            seasonName: receivedSeasonName,
          });
          result = {
            teamSeasonId: existing.team_season_id,
            seasonName: receivedSeasonName,
            teamName: recievedTeamName,
            wasModified: false,
          };
        }
      } else {
        this.logger.info(
          "Team season doesn't exist, inserting with latest events",
          { teamName: recievedTeamName, seasonName: receivedSeasonName },
        );
        const teamSeasonId = uuidv4();
        await trx('team_season').insert<DataTypes.TeamSeason>({
          team_season_id: teamSeasonId,
          season_name: receivedSeasonName,
          team_name: recievedTeamName,
        });
        await trx('team_season_event').insert<DataTypes.TeamSeasonEvent>({
          team_season_event_id: uuidv4(),
          team_season_id: teamSeasonId,
          events: JSON.stringify(receivedEvents),
          event_duration_minutes: recievedMatchDuration,
          timezone: recievedTimezone,
          scraped_at: receivedTimeScraped,
        });
        result = {
          teamSeasonId,
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
