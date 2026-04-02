'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const vinyls = await queryInterface.sequelize.query(
      `SELECT "vinylId" FROM vinyls;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const userVinyls = [];

    users.forEach((user) => {
      const count = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...vinyls].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));

      selected.forEach((vinyl) => {
        userVinyls.push({
          userId: user.id,
          vinylId: vinyl.vinylId,
          purchasedAt: new Date(),
        });
      });
    });

    await queryInterface.bulkInsert('userVinyls', userVinyls, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userVinyls', null, {});
  },
};
