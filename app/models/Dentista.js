const { Model, DataTypes } = require("sequelize");

class Dentista extends Model {
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
        nr_cro: { type: DataTypes.INTEGER, allowNull: false, validate: { len: [1, 6] } },
        dt_liberacao: DataTypes.DATEONLY,
        dt_bloqueio: DataTypes.DATEONLY,
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pessoa, { foreignKey: "id", as: "Pessoa" });
    this.belongsToMany(models.Procedimento, {
      foreignKey: "dentista_id", through: "procedimentos_dentistas",
      as: "Procedimentos",
    });
    this.hasMany(models.Disponibilidade, { foreignKey: "dentista_id", as: "Disponibilidades" });
    this.hasMany(models.Atendimento, { foreignKey: "dentista_id", as: "Atendimentos" });
  }
}

module.exports = Dentista;
