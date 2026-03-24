'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      roleId: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user',
      },
      name: {
        type: Sequelize.STRING,
      },
      lastname: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      googleSub: {
        type: Sequelize.STRING,
      },
      birthdate: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sessionVersion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
