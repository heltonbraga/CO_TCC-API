"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "procedimento",
      [
        {
          nome: "profilaxia",
          dm_tipo: "livre",
          duracao: 30,
        },
        {
          nome: "clareamento",
          dm_tipo: "livre",
          duracao: 30,
        },
        {
          nome: "canal",
          dm_tipo: "restrito",
          duracao: 30,
        },
        {
          nome: "restauração",
          dm_tipo: "restrito",
          duracao: 30,
        },
        {
          nome: "consulta",
          dm_tipo: "livre",
          duracao: 30,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("procedimento", null, {});
  },
};
