"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "pessoa",
          {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true,
              allowNull: false,
            },
            nome: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            email: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            nr_cpf: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            sexo: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            dt_nascimento: {
              type: Sequelize.DATE,
              allowNull: true,
            },
            nr_tel: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            nr_tel_2: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            nr_cep: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            sg_uf: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            nm_cidade: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            de_endereco: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            de_endereco_comp: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            perfil: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            dt_exclusao: {
              type: Sequelize.DATE,
              allowNull: false,
            },
          },
          { tableName: "pessoa", transaction: t }
        ),
        queryInterface.createTable(
          "dentista",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              references: { model: 'pessoa', key: 'id' },
            },
            nr_cro: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            dt_liberacao: {
              type: Sequelize.DATE,
              allowNull: true,
            },
            dt_bloqueio: {
              type: Sequelize.DATE,
              allowNull: true,
            },
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "paciente",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              references: { model: 'pessoa', key: 'id' },
            },
            plano_tratamento: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            dm_situacao: {
              type: Sequelize.STRING,
              allowNull: true,
            },
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "auxiliar",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              references: { model: 'pessoa', key: 'id' },
            },
            nr_cro: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            dm_formacao: {
              type: Sequelize.STRING,
              allowNull: false,
            },
          },
          { transaction: t }
        ),
      ]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable("auxiliar", {transaction: t}),
        queryInterface.dropTable("paciente", {transaction: t}),
        queryInterface.dropTable("dentista", {transaction: t}),
        queryInterface.dropTable("pessoa", {transaction: t}),
      ]);
    });
  },
};
