"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "banco",
      [
        { codigo: 1, nome: "Banco do Brasil S/A" },
        { codigo: 3, nome: "Banco da Amazônia S.A" },
        { codigo: 4, nome: "Banco do Nordeste do Brasil S.A" },
        { codigo: 104, nome: "Caixa Econômica Federal" },
        { codigo: 237, nome: "Banco Bradesco S.A" },
        { codigo: 252, nome: "Banco Fininvest S.A" },
        { codigo: 341, nome: "Banco Itaú S.A" },
        { codigo: 422, nome: "Banco Safra S.A" },
        { codigo: 502, nome: "Banco Santander S.A" },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("banco", null, {});
  },
};
