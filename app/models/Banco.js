const { Model, DataTypes } = require("sequelize");

class Banco extends Model {
  static init(sequelize) {
    super.init(
      {
        codigo: { type: DataTypes.INTEGER, primaryKey: true },
        nome: DataTypes.STRING,
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.BancoPessoa, { foreignKey: 'banco_codigo', as: 'banco_pessoa' });
  }
}

module.exports = Banco;
