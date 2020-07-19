"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "dentista",
      [
        {
          id: 41,
          nr_cro: 1111,
        },
        {
          id: 51,
          nr_cro: 2222,
        },
        {
          id: 61,
          nr_cro: 3333,
        },
        {
          id: 71,
          nr_cro: 4444,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("dentista", null, {});
  },
};
