'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = Array.from({ length: 10 }).map(() => ({
      id: faker.string.uuid(),
      roleId: 'user',
      name: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      googleSub: '',
      birthdate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      avatar: faker.image.avatar(),
      sessionVersion: 0,
    }));

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
