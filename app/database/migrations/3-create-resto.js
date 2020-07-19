"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "banco",
          {
            codigo: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              allowNull: false,
            },
            nome: {
              type: Sequelize.STRING,
              allowNull: false,
            },
          },
          { tableName: "banco", transaction: t }
        ),
        queryInterface.createTable(
          "banco_pessoa",
          {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true,
              allowNull: false,
            },
            pessoa_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "pessoa", key: "id" },
            },
            banco_codigo: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "banco", key: "codigo" },
            },
            agencia: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            conta: {
              type: Sequelize.STRING,
              allowNull: false,
            },
          },
          { tableName: "banco_pessoa", transaction: t }
        ),
        queryInterface.createTable(
          "parametro",
          {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              allowNull: false,
              autoIncrement: true,
            },
            codigo: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            valor: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            filhos: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
            },
            pai_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: { model: "parametro", key: "id" },
            },
          },
          { tableName: "parametro", transaction: t }
        ),
        queryInterface.createTable(
          "disponibilidade",
          {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              allowNull: false,
              autoIncrement: true,
            },
            dentista_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "dentista", key: "id" },
            },
            dm_dia_semana: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            hr_inicio: {
              type: Sequelize.TIME,
              allowNull: false,
            },
            hr_fim: {
              type: Sequelize.TIME,
              allowNull: false,
            },
          },
          { tableName: "disponibilidade", transaction: t }
        ),
      ]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable("disponibilidade", { transaction: t }),
        queryInterface.dropTable("parametro", { transaction: t }),
        queryInterface.dropTable("banco_pessoa", { transaction: t }),
        queryInterface.dropTable("banco", { transaction: t }),
      ]);
    });
  },
};
