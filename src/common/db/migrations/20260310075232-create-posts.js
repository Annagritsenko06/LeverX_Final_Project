'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('posts', {
      postId: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      authorId: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT('long'), allowNull: false },
      createdData: { type: DataTypes.DATE, allowNull: true },
      updatedData: { type: DataTypes.DATE, allowNull: true },
      likes: { type: DataTypes.JSON, allowNull: true },
    });
    await queryInterface.addConstraint('posts', {
      fields: ['authorId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  },
};
