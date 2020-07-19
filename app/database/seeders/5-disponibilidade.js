"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "disponibilidade",
      [
        {
          dentista_id: 41,
          dm_dia_semana: "segunda",
          hr_inicio: "08:00:00",
          hr_fim: "12:00:00",
        },
        {
          dentista_id: 41,
          dm_dia_semana: "quarta",
          hr_inicio: "08:00:00",
          hr_fim: "12:00:00",
        },
        {
          dentista_id: 41,
          dm_dia_semana: "sexta",
          hr_inicio: "08:00:00",
          hr_fim: "12:00:00",
        },
        {
          dentista_id: 51,
          dm_dia_semana: "terça",
          hr_inicio: "08:00:00",
          hr_fim: "12:00:00",
        },
        {
          dentista_id: 51,
          dm_dia_semana: "quinta",
          hr_inicio: "08:00:00",
          hr_fim: "12:00:00",
        },
        {
          dentista_id: 61,
          dm_dia_semana: "segunda",
          hr_inicio: "13:00:00",
          hr_fim: "17:00:00",
        },
        {
          dentista_id: 61,
          dm_dia_semana: "quarta",
          hr_inicio: "13:00:00",
          hr_fim: "17:00:00",
        },
        {
          dentista_id: 61,
          dm_dia_semana: "sexta",
          hr_inicio: "13:00:00",
          hr_fim: "17:00:00",
        },
        {
          dentista_id: 71,
          dm_dia_semana: "segunda",
          hr_inicio: "13:00:00",
          hr_fim: "17:00:00",
        },
        {
          dentista_id: 71,
          dm_dia_semana: "quarta",
          hr_inicio: "13:00:00",
          hr_fim: "17:00:00",
        },
        {
          dentista_id: 71,
          dm_dia_semana: "sexta",
          hr_inicio: "13:00:00",
          hr_fim: "17:00:00",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("disponibilidade", null, {});
  },
};
