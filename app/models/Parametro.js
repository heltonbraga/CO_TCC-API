const { Model, DataTypes } = require("sequelize");

class Parametro extends Model {
  static init(sequelize) {
    super.init(
      {
        codigo: DataTypes.STRING,
        valor: DataTypes.STRING,
        filhos: DataTypes.BOOLEAN,
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.hasOne(Parametro, { foreignKey: "pai_id", as: "ParametroPai" });
  }
}

module.exports = Parametro;
