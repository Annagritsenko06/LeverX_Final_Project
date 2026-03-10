'use strict';
const { fakerDE: faker } = require('@faker-js/faker');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(`SELECT id FROM users;`);
    const userIds = users[0].map((u) => u.id);

    const posts = [];
    userIds.forEach((authorId) => {
      for (let i = 0; i < 2; i++) {
        posts.push({
          postId: faker.string.uuid(),
          authorId,
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          likes: JSON.stringify([]),
          createdData: new Date(),
          updatedData: new Date(),
        });
      }
    });

    await queryInterface.bulkInsert('posts', posts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('posts', {}, {});
  },
};
