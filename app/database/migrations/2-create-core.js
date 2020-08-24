"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "procedimento",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true,
            },
            nome: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            dm_tipo: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            duracao: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "procedimentos_dentistas",
          {
            dentista_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              references: { model: "dentista", key: "id" },
            },
            procedimento_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              references: { model: "procedimento", key: "id" },
            },
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "atendimento",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true,
            },
            procedimento_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "procedimento", key: "id" },
            },
            dentista_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "dentista", key: "id" },
            },
            paciente_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "paciente", key: "id" },
            },
            anterior_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: { model: "atendimento", key: "id" },
            },
            dt_horario: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            encaminhamento: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            dm_convenio: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            dm_situacao: {
              type: Sequelize.STRING,
              allowNull: false,
            },
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "log_atendimento",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true,
            },
            pessoa_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "pessoa", key: "id" },
            },
            atendimento_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "atendimento", key: "id" },
            },
            acao: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            dt_acao: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            complemento: {
              type: Sequelize.STRING,
              allowNull: true,
            },
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "anamnese",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true,
            },
            paciente_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "paciente", key: "id" },
            },
            dm_alergia: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            de_alergia: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            dm_pressao: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            dm_sangue: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            de_medicamento: {
              type: Sequelize.STRING,
              allowNull: true,
            },
            observacao: {
              type: Sequelize.STRING,
              allowNull: true,
            },
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "prontuario",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true,
            },
            paciente_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "paciente", key: "id" },
            },
            dentista_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "dentista", key: "id" },
            },
            dt_horario: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            anotacao: {
              type: Sequelize.STRING,
              allowNull: true,
            },
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "exame",
          {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true,
            },
            prontuario_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: "prontuario", key: "id" },
            },
            descricao: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            url: {
              type: Sequelize.STRING,
              allowNull: true,
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
        queryInterface.dropTable("exame", {transaction: t}),
        queryInterface.dropTable("prontuario", {transaction: t}),
        queryInterface.dropTable("anamnese", {transaction: t}),
        queryInterface.dropTable("atendimento", {transaction: t}),
        queryInterface.dropTable("log_atendimento", {transaction: t}),
        queryInterface.dropTable("procedimentos_dentistas", {transaction: t}),
        queryInterface.dropTable("procedimento", {transaction: t}),
      ]);
    });
  },
};
