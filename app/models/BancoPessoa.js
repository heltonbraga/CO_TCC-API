const { Model, DataTypes } = require("sequelize");

class BancoPessoa extends Model {
  static init(sequelize) {
    super.init(
      {
        agencia: DataTypes.STRING,
        conta: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "banco_pessoa",
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pessoa, { foreignKey: "pessoa_id", as: "pessoa" });
    this.belongsTo(models.Banco, { foreignKey: "banco_codigo", as: "banco" });
  }
}

module.exports = BancoPessoa;
