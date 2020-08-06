module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'internal_season',
      password: process.env.MYSQL_PASS || 'internal_season',
      database: process.env.MYSQL_DATABASE || 'season_data',
    },
  },
};
