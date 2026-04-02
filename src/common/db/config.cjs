const { config } = require('dotenv');
const path = require('path');

config({ path: path.resolve(__dirname, '../../../.env') });

const {
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_SSL,
} = process.env;

module.exports = {
  production: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: parseInt(DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: {
      ssl: DB_SSL === 'true'
        ? { require: true, rejectUnauthorized: false }
        : false,
    },
  },
};
