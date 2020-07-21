import { Event, Team } from '@teamest/models/raw';
import { EventType } from '@teamest/models/raw/event';
import { EventGuards } from '@teamest/models/helpers';

import * as G from './grpc-types/season_pb';

export function packageTeam(team: Team): G.Team {
  const result = new G.Team();
  result.setIsExternal(team.isExternal);
  result.setName(team.name);
  return result;
}

export function unpackageTeam(team: G.Team): Team {
  return team.toObject();
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

export function packageEvent(event: Event): G.EventWrapper {
  const rawMatch = EventGuards.eventAsMatch(event);
  const rawDuty = EventGuards.eventAsDuty(event);

  const result = new G.EventWrapper();
  if (rawDuty) {
    const duty = new G.Duty();
    if (rawDuty.home) duty.setHome(packageTeam(rawDuty.home));
    if (rawDuty.away) duty.setAway(packageTeam(rawDuty.away));
    duty.setDuty(packageTeam(rawDuty.duty));
    if (rawDuty.round) duty.setRound(rawDuty.round);
    result.setDuty(duty);
  }

  if (rawMatch) {
    const duty = new G.Duty();
    duty.setHome(packageTeam(rawMatch.home));
    duty.setAway(packageTeam(rawMatch.away));
    if (rawMatch.duty) duty.setDuty(packageTeam(rawMatch.duty));
    if (rawMatch.round) duty.setRound(rawMatch.round);
    result.setDuty(duty);
  }

  result.setType(packageEventType(event.type));

  return result;
}

export function unpackageEvent(wrappedEvent: G.EventWrapper) {
  const match = wrappedEvent.getMatch();
  const duty = wrappedEvent.getDuty();

  return {
    type: wrappedEvent.getType(),
    ...(match && match.toObject()),
    ...(duty && duty.toObject()),
  };
}
