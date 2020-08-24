const { Model, DataTypes } = require("sequelize");

class LogAtendimento extends Model {
  static init(sequelize) {
    super.init(
      {
        acao: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        dt_acao: { type: DataTypes.DATE, allowNull: false },
        complemento: DataTypes.STRING,
        pessoa_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "pessoa",
            key: "id",
          },
        },
        atendimento_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "atendimento",
            key: "id",
          },
        },
      },
      {
        sequelize,
        tableName: "log_atendimento",
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pessoa, { foreignKey: "pessoa_id", as: "Pessoa" });
    this.belongsTo(models.Atendimento, { foreignKey: "atendimento_id", as: "Atendimento" });
  }
}

module.exports = LogAtendimento;
