import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import { Post } from './models/post.model.js';
import 'dotenv/config';
import { User } from './models/user.model.js';

export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: 'applicationdb',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: 'localhost',
  port: 3306,
  define: {
    timestamps: false,
  },
});

sequelize.addModels([User, Post]);

export default sequelize;
