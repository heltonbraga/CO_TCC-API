const { Model, DataTypes } = require("sequelize");

class Paciente extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: "pessoa",
            key: "id",
          },
        },
        plano_tratamento: DataTypes.STRING,
        dm_situacao: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isIn: [
              [
                "em tratamento",
                "pendente exames",
                "pendente retorno",
                "agendado",
                "sem vinculo",
                "sem resposta",
              ],
            ],
          },
        },
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pessoa, { foreignKey: "id", as: "Pessoa" });
    this.hasMany(models.Atendimento, { foreignKey: "paciente_id", as: "Atendimentos" });
    this.hasOne(models.Anamnese, { foreignKey: "paciente_id", as: "Anamnese" });
  }
}

module.exports = Paciente;
