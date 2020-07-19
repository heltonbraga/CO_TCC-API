"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "procedimentos_dentistas",
      [
        {
          dentista_id: 41,
          procedimento_id: 11,
        },
        {
          dentista_id: 41,
          procedimento_id: 21,
        },
        {
          dentista_id: 41,
          procedimento_id: 31,
        },
        {
          dentista_id: 41,
          procedimento_id: 41,
        },
        {
          dentista_id: 41,
          procedimento_id: 1,
        },
        {
          dentista_id: 51,
          procedimento_id: 11,
        },
        {
          dentista_id: 51,
          procedimento_id: 1,
        },
        {
          dentista_id: 51,
          procedimento_id: 21,
        },
        {
          dentista_id: 61,
          procedimento_id: 21,
        },
        {
          dentista_id: 71,
          procedimento_id: 21,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("procedimentos_dentistas", null, {});
  },
};
