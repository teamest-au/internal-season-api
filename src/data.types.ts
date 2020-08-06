import { SerialisedEvent } from "@teamest/models/raw";

export interface TeamSeason {
  team_season_id: string;
  team_name: string;
  season_name: string;
  created_at: string;
  updated_at: string;
}

export interface TeamSeasonEvent {
  team_season_event_id: string;
  team_season_id: string;
  timezone: string;
  event_duration_minutes: number;
  events: SerialisedEvent[];
  scraped_at: string;
  created_at: string;
  updated_at: string;
}
