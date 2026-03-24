import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { initUserModel, User } from './models/user.model';
import { initVinylModel, Vinyl } from './models/vinyl.model';
import { initReviewModel, Review } from './models/review.model';
import {
  initPurchasedVinylModel,
  PurchasedVinyl,
} from './models/purchased-vinyl.model';
export const sequelize = new Sequelize({
  dialect: PostgresDialect,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
  define: {
    timestamps: false,
  },
});

initVinylModel(sequelize);
initUserModel(sequelize);
initReviewModel(sequelize);
initPurchasedVinylModel(sequelize);

User.belongsToMany(Vinyl, {
  through: PurchasedVinyl,
  foreignKey: 'userId',
  otherKey: 'vinylId',
  as: 'vinyls',
});

Vinyl.belongsToMany(User, {
  through: PurchasedVinyl,
  foreignKey: 'vinylId',
  otherKey: 'userId',
  as: 'users',
});

if (!Review.associations['user']) {
  Review.belongsTo(User, { foreignKey: 'userId' });
}

if (!Review.associations['vinyl']) {
  Review.belongsTo(Vinyl, { foreignKey: 'vinylId' });
}

if (!User.associations['reviews']) {
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
}

export default sequelize;
