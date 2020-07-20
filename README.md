# Internal Season API

Internal gRPC service responsible for management of season data.

Server published to dockerhub: `teamest/internal-season-api`

Client published to npm: `@teamest/internal-season-service`

## Available Services

### UpdateTeamSeason

Takes a TeamSeason to update, returns a TeamSeasonResult to indicate if any changes were
written as part of the update.
