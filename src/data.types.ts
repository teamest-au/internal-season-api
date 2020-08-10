import { SerialisedEvent } from "@teamest/models/raw";

export interface TeamSeason {
  team_season_id: string;
  team_name: string;
  competition_name: string;
  season_name: string;
  created_at: string;
  updated_at: string;
}

export interface TeamSeasonVersion {
  team_season_version_id: string;
  team_season_id: string;
  events: SerialisedEvent[];
  first_scraped: string;
  last_scraped: string;
}
