# Internal Season API

Internal http service responsible for management of season data.

Server published to dockerhub: `teamest/internal-season-api`

Client published to npm: `@teamest/internal-season-client`

## Available Services

### UpdateTeamSeason

Takes a TeamSeason to update, returns a TeamSeasonResult to indicate if any changes were
written as part of the update.

## Usage

### Configuration

Provide all configuration details via environment variables

| Name                     | Default Value                         | Description                                |
| ------------------------ | ------------------------------------- | ------------------------------------------ |
| PORT                     | 9001                                  | Port to listen for internal http requests  |
| MYSQL_HOST               | localhost                             | Hostname of the mysql instance             |
| MYSQL_USER               | internal_season                       | Username to connect to mysql               |
| MYSQL_PASS               | internal_season                       | Password to connect to mysql               |
| MYSQL_DATABASE           | season_data                           | The mysql database to use for data         |
| LOG_LEVEL                | info                                  | The minimum log level that will be printed |

### Docker Run

A manual run can be done with docker using the following command:

`docker run --env-file=.env teamest/scraper-worker`

### Local Runs

A local run can be done with:

`npm run dev`

### Migrations

Migrate with `npx knex migrate:latest`

Rollback last migration batch with `npx knex migrate:rollback`
