'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    const vinyls = Array.from({ length: 50 }).map(() => ({
      vinylId: faker.string.uuid(),
      authorName: faker.person.fullName(),
      name: faker.music.songName(),
      description: faker.lorem.paragraphs({ min: 1, max: 3 }),
      price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
      firstReview: faker.lorem.sentence({ min: 4, max: 8 }),
      averageScope: parseFloat(
        faker.number.float({ min: 1.0, max: 5.0, precision: 0.01 }),
      ),
      image: faker.image.url(),
    }));

    await queryInterface.bulkInsert('vinyls', vinyls, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('vinyls', null, {});
  },
};
