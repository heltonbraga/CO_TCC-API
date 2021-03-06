const { Model, DataTypes } = require("sequelize");

class Atendimento extends Model {
  static init(sequelize) {
    super.init(
      {
        dm_situacao: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { isIn: [["agendado", "confirmado", "cancelado", "realizado"]] },
        },
        dt_horario: { type: DataTypes.DATE, allowNull: false },
        encaminhamento: DataTypes.STRING,
        dm_convenio: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isIn: [
              [
                "particular",
                "uniodonto",
                "amil",
                "unimed",
                "metlife",
                "odonto system",
                "camed",
                "gamec",
                "odontoprev",
                "sulamerica",
              ],
            ],
          },
        },
        procedimento_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "procedimento",
            key: "id",
          },
        },
        paciente_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "paciente",
            key: "id",
          },
        },
        dentista_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "dentista",
            key: "id",
          },
        },
        anterior_id: {
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
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Procedimento, { foreignKey: "procedimento_id", as: "Procedimento" });
    this.belongsTo(models.Dentista, { foreignKey: "dentista_id", as: "Dentista" });
    this.belongsTo(models.Paciente, { foreignKey: "paciente_id", as: "Paciente" });
    this.hasOne(Atendimento, { foreignKey: "anterior_id", as: "AtendimentoAnterior" });
  }
}

module.exports = Atendimento;
