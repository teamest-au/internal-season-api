import { Event, Team, Match, Duty } from '@teamest/models/raw';
import { EventType } from '@teamest/models/raw/event';
import { EventGuards } from '@teamest/models/helpers';

import * as google_protobuf_wrappers_pb from 'google-protobuf/google/protobuf/wrappers_pb';
import * as G from './grpc-types/season_pb';

export function packageOptionalString(
  value?: string,
): google_protobuf_wrappers_pb.StringValue | undefined {
  if (value) {
    const result = new google_protobuf_wrappers_pb.StringValue();
    result.setValue(value);
    return result;
  }
  return undefined;
}

export function unpackageOptionalString(
  value: google_protobuf_wrappers_pb.StringValue | undefined,
): string | undefined {
  if (value && value.getValue()) {
    return value.getValue();
  }
  return undefined;
}

export function packageTime(time: Date): string {
  return time.toISOString();
}

export function unpackageTime(time: string): Date {
  return new Date(time);
}

export function packageTeam(team: Team | undefined): G.Team | undefined {
  if (team) {
    const result = new G.Team();
    result.setIsExternal(team.isExternal);
    result.setName(team.name);
    return result;
  }
  return undefined;
}

export function unpackageTeam(team: G.Team | undefined): Team | undefined {
  if (team) {
    return team.toObject();
  }
  return undefined;
}

export function packageEventType(type: EventType) {
  switch (type) {
    case 'duty':
      return G.EventType.DUTY;
    case 'match':
      return G.EventType.MATCH;
    case 'other':
    default:
      return G.EventType.OTHER;
  }
}

export function unpackageEventType(type: number): EventType {
  switch (type) {
    case G.EventType.DUTY:
      return 'duty';
    case G.EventType.MATCH:
      return 'match';
    case G.EventType.OTHER:
    default:
      return 'other';
  }
}

function packageMatchFields(rawMatch: Match): G.EventWrapper {
  const result = new G.EventWrapper();
  const match = new G.Match();
  match.setHome(packageTeam(rawMatch.home));
  match.setAway(packageTeam(rawMatch.away));
  if (rawMatch.duty) match.setDuty(packageTeam(rawMatch.duty));
  match.setRound(packageOptionalString(rawMatch.round));
  result.setDuty(match);
  return result;
}

function unpackageMatchFields(event: G.EventWrapper) {
  const match = event.getMatch();
  if (match) {
    return {
      home: unpackageTeam(match.getHome()),
      away: unpackageTeam(match.getAway()),
      duty: unpackageTeam(match.getDuty()),
      round: unpackageOptionalString(match.getRound()),
    };
  } else {
    return false;
  }
}

function packageDutyFields(rawDuty: Duty): G.EventWrapper {
  const result = new G.EventWrapper();
  const duty = new G.Duty();
  if (rawDuty.home) duty.setHome(packageTeam(rawDuty.home));
  if (rawDuty.away) duty.setAway(packageTeam(rawDuty.away));
  duty.setDuty(packageTeam(rawDuty.duty));
  if (rawDuty.round) duty.setRound(packageOptionalString(rawDuty.round));
  result.setDuty(duty);
  return result;
}

function unpackageDutyFields(event: G.EventWrapper) {
  const duty = event.getDuty();
  if (duty) {
    return {
      home: unpackageTeam(duty.getHome()),
      away: unpackageTeam(duty.getAway()),
      duty: unpackageTeam(duty.getDuty()),
      round: unpackageOptionalString(duty.getRound()),
    };
  } else {
    return false;
  }
}

export function packageEvent(event: Event): G.EventWrapper {
  const rawMatch = EventGuards.eventAsMatch(event);
  const rawDuty = EventGuards.eventAsDuty(event);

  let result;
  if (rawDuty) {
    result = packageDutyFields(rawDuty);
  } else if (rawMatch) {
    result = packageMatchFields(rawMatch);
  } else {
    throw new Error();
  }

  result.setType(packageEventType(event.type));
  result.setTime(packageTime(event.time));
  result.setCourt(packageOptionalString(event.court));
  result.setVenue(packageOptionalString(event.venue));

  return result;
}

export function unpackageEvent(wrappedEvent: G.EventWrapper): Event {
  return {
    type: unpackageEventType(wrappedEvent.getType()),
    time: unpackageTime(wrappedEvent.getTime()),
    court: unpackageOptionalString(wrappedEvent.getCourt()),
    venue: unpackageOptionalString(wrappedEvent.getVenue()),
    ...unpackageMatchFields(wrappedEvent),
    ...unpackageDutyFields(wrappedEvent),
  };
}
