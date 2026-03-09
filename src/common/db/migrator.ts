import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from './db';

export const migrator = new Umzug({
  migrations: {
    glob: 'src/common/db/migrations/*.ts',
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
    tableName: 'migrations',
  }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;
