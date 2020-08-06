CREATE USER 'internal_season'@'%' IDENTIFIED BY 'internal_season';
ALTER USER 'internal_season'@'%' IDENTIFIED WITH mysql_native_password BY 'internal_season';
CREATE DATABASE season_data CHARACTER SET utf8 COLLATE utf8_unicode_ci;
GRANT ALL PRIVILEGES ON season_data.* TO 'internal_season'@'%';
