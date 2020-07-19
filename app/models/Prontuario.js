const { Model, DataTypes } = require("sequelize");

class Prontuario extends Model {
  static init(sequelize) {
    super.init(
      {
        dt_horario: { type: DataTypes.DATE, allowNull: false },
        anotacao: DataTypes.STRING,
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
