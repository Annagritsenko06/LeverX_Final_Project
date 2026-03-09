import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { setupAssociations } from '../models/associations';

export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: 'applicationdb',
  user: 'Anna',
  password: 'Super_star7310013',
  host: 'localhost',
  port: 3306,
  define: {
    timestamps: false,
  },
});

sequelize.addModels([User, Post]);
setupAssociations();

export default sequelize;
