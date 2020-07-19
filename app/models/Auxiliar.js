const { Model, DataTypes } = require("sequelize");

class Auxiliar extends Model {
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
        nr_cro: { type: DataTypes.INTEGER, allowNull: true, validate: { len: [1, 7] } },
        dm_formacao: {
          type: DataTypes.STRING,
          validate: { isIn: [["TSB", "ASB", "ETSB", "EASB"]] },
        },
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pessoa, { foreignKey: "id", as: "Pessoa" });
  }
}

module.exports = Auxiliar;
