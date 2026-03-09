import { DataTypes } from '@sequelize/core';
import { sequelize } from '../db';

export const up = async () => {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('users', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    lastname: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(100), allowNull: false },
  });

  await qi.createTable('posts', {
    postId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    authorId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING(100), allowNull: false },
    createdData: { type: DataTypes.DATE, allowNull: true },
    updatedData: { type: DataTypes.DATE, allowNull: true },
    likes: { type: DataTypes.JSON, allowNull: true },
  });

  await qi.addConstraint('posts', {
    fields: ['authorId'],
    type: 'FOREIGN KEY',
    references: {
      table: 'users',
      field: 'id',
    },
    onDelete: 'CASCADE',
  });
};

export const down = async () => {
  const qi = sequelize.getQueryInterface();
  await qi.dropTable('posts');
  await qi.dropTable('users');
};
