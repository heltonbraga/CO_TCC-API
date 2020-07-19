const { Model, DataTypes } = require("sequelize");

class Procedimento extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { notEmpty: true },
        },
        dm_tipo: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isIn: [["livre", "restrito"]],
          },
        },
        duracao: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: { min: 10, max: 120 },
        },
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Atendimento, { foreignKey: "procedimento_id", as: "Atendimentos" });
    this.belongsToMany(models.Dentista, { foreignKey: "procedimento_id", through: 'procedimentos_dentistas', as: "Dentistas" });
  }
}

module.exports = Procedimento;
