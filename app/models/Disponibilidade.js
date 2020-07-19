const { Model, DataTypes } = require("sequelize");

class Disponibilidade extends Model {
  static init(sequelize) {
    super.init(
      {
        dentista_id: {
          type: DataTypes.INTEGER,
          references: {
            model: "dentista",
            key: "id",
          },
        },
        dm_dia_semana: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isIn: [["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]],
          },
        },
        hr_inicio: {
          type: DataTypes.TIME,
          allowNull: false,
        },
        hr_fim: {
          type: DataTypes.TIME,
          allowNull: false,
          validate: { isAfter: this.hr_inicio },
        },
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Dentista, { foreignKey: "dentista_id", as: "Dentista" });
  }
}

module.exports = Disponibilidade;
