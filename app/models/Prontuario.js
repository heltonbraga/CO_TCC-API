const { Model, DataTypes } = require("sequelize");

class Prontuario extends Model {
  static init(sequelize) {
    super.init(
      {
        dt_horario: { type: DataTypes.DATE, allowNull: false },
        anotacao: DataTypes.STRING,
        dentista_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Dentista",
            key: "id",
          },
        },
        paciente_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Paciente",
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
    this.belongsTo(models.Dentista, { foreignKey: "dentista_id", as: "Dentista" });
    this.belongsTo(models.Paciente, { foreignKey: "paciente_id", as: "Paciente" });
    this.hasMany(models.Exame, { foreignKey: "prontuario_id", as: "Exames" });
  }
}

module.exports = Prontuario;
