const { Model, DataTypes } = require("sequelize");

class Exame extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: DataTypes.STRING,
        url: DataTypes.STRING,
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Prontuario, { foreignKey: "prontuario_id", as: "Prontuario" });
  }
}

module.exports = Exame;
