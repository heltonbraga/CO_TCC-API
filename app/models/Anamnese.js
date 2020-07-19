const { Model, DataTypes } = require("sequelize");

class Anamnese extends Model {
  static init(sequelize) {
    super.init(
      {
        dm_alergia: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { isIn: [["nenhuma", "antibióticos", "analgésicos", "outros"]] },
        },
        de_alergia: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        dm_pressao: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { isIn: [["normal", "alta", "baixa"]] },
        },
        dm_sangue: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { isIn: [["o+", "o-", "a+", "a-", "b+", "b-", "ab+", "ab-"]] },
        },
        de_medicamento: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        observacao: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Paciente, { foreignKey: "paciente_id", as: "Paciente" });
  }
}

module.exports = Anamnese;
