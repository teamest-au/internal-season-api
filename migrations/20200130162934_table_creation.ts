import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable('team_season', function(table) {
    table.uuid('team_season_id').primary();
    table.string('team_name').notNullable();
    table.string('competition_name').notNullable();
    table.string('season_name').notNullable();
    table.timestamps(false, true);
  });

  return knex.schema.createTable('team_season_version', function(table) {
    table.uuid('team_season_version_id').primary();
    table.uuid('team_season_id').notNullable();
    table.foreign('team_season_id').references('team_season.team_season_id');
    table.json('events').notNullable();
    table.dateTime('first_scraped').notNullable();
    table.dateTime('last_scraped').notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.dropTable('team_season_version');
  return knex.schema.dropTable('team_season');
}
