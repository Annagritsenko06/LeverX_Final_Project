'use strict';
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, name FROM users;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const vinyls = await queryInterface.sequelize.query(
      `SELECT "vinylId", name FROM vinyls;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const reviews = [];

    users.forEach((user) => {
      const numberOfReviews = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < numberOfReviews; i++) {
        const vinyl = faker.helpers.arrayElement(vinyls);

        reviews.push({
          reviewId: faker.string.uuid(),
          userId: user.id,
          vinylId: vinyl.vinylId,
          comment: faker.lorem.paragraph({ min: 2, max: 4 }),
          reviewScore: faker.number.int({ min: 1, max: 5 }),
        });
      }
    });

    await queryInterface.bulkInsert('reviews', reviews, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reviews', null, {});
  },
};
