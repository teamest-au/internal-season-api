const grpc = require("@grpc/grpc-js");

import { Event, Team } from "@teamest/models/raw";
import { TeamSeason } from "@teamest/models/processed";
import { ProcessedSerialisers, EventGuards } from "@teamest/models/helpers";
import {
  TeamSeason as GrpcTeamSeason,
  UpdateTeamSeasonResult as GrpcTeamSeasonResult,
  Duty as GrpcDuty,
  Team as GrpcTeam,
  EventType as GrpcEventType,
  EventWrapper,
} from "./season_pb";
import { SeasonClient } from "./season_grpc_pb";
import { EventType } from "@teamest/models/raw/event";

function packageTeam(team: Team): GrpcTeam {
  const result = new GrpcTeam();
  result.setIsExternal(team.isExternal);
  result.setName(team.name);
  return result;
}

function packageEventType(type: EventType) {
  switch (type) {
    case "duty":
      return GrpcEventType.DUTY;
    case "match":
      return GrpcEventType.MATCH;
    case "other":
    default:
      return GrpcEventType.OTHER;
  }
}

function packageEvent(event: Event): EventWrapper {
  const rawMatch = EventGuards.eventAsMatch(event);
  const rawDuty = EventGuards.eventAsDuty(event);

  const result = new EventWrapper();
  if (rawDuty) {
    const duty = new GrpcDuty();
    if (rawDuty.home) duty.setHome(packageTeam(rawDuty.home));
    if (rawDuty.away) duty.setAway(packageTeam(rawDuty.away));
    duty.setDuty(packageTeam(rawDuty.duty));
    if (rawDuty.round) duty.setRound(rawDuty.round);
    result.setDuty(duty);
  }

  if (rawMatch) {
    const duty = new GrpcDuty();
    duty.setHome(packageTeam(rawMatch.home));
    duty.setAway(packageTeam(rawMatch.away));
    if (rawMatch.duty) duty.setDuty(packageTeam(rawMatch.duty));
    if (rawMatch.round) duty.setRound(rawMatch.round);
    result.setDuty(duty);
  }

  result.setType(packageEventType(event.type));

  return result;
}

export default class SeasonService {
  client: SeasonClient;

  constructor(service_uri: string) {
    this.client = new SeasonClient(
      service_uri,
      grpc.credentials.createInsecure()
    );
  }

  async updateTeamSeason(
    teamSeason: TeamSeason
  ): Promise<GrpcTeamSeasonResult> {
    const serialisedTeamSeason = ProcessedSerialisers.serialiseTeamSeason(
      teamSeason
    );
    const grpcTeamSeason: GrpcTeamSeason = new GrpcTeamSeason();
    grpcTeamSeason.setMatchDuration(serialisedTeamSeason.matchDuration);
    grpcTeamSeason.setSeasonName(serialisedTeamSeason.seasonName);
    grpcTeamSeason.setTeamName(serialisedTeamSeason.teamName);
    grpcTeamSeason.setTimeScraped(serialisedTeamSeason.timeScraped);
    grpcTeamSeason.setTimezone(serialisedTeamSeason.timezone);
    grpcTeamSeason.setWrappedEventsList(teamSeason.events.map(packageEvent));
    return new Promise((resolve, reject) => {
      this.client.updateTeamSeason(grpcTeamSeason, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
}

async function test() {
  const s = new SeasonService("localhost");
  const result = await s.updateTeamSeason({
    seasonName: "Test Season",
    teamName: "Dateko",
    events: [],
    matchDuration: 60,
    timeScraped: new Date(),
    timezone: "Australia/Adelaide",
  });
  console.log(result);
}

test().then(
  () => {
    process.exit(0);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
