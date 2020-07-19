const { Model, DataTypes } = require("sequelize");
const { validate: validarCpf } = require("gerador-validador-cpf");

class Pessoa extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: { notEmpty: true },
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: { isEmail: true, notNull: true },
        },
        nr_cpf: {
          type: DataTypes.INTEGER,
          validate: {
            isCpfValido(value) {
              let str = ("00000000000" + value).slice(-11);
              if (!validarCpf(str)) throw new Error("CPF inválido.");
            },
          },
        },
        sexo: { type: DataTypes.STRING, validate: { isIn: [["M", "F"]] } },
        dt_nascimento: DataTypes.DATE,
        nr_tel: DataTypes.STRING,
        nr_tel_2: DataTypes.STRING,
        nr_cep: { type: DataTypes.INTEGER, validate: { len: 8 } },
        sg_uf: {
          type: DataTypes.STRING,
          validate: {
            isIn: [
              [
                "AC",
                "AL",
                "AM",
                "AP",
                "BA",
                "CE",
                "DF",
                "ES",
                "GO",
                "MA",
                "MT",
                "MS",
                "PA",
                "PB",
                "PR",
                "PE",
                "PI",
                "RJ",
                "RN",
                "RS",
                "RO",
                "SC",
                "SP",
                "SE",
                "TO",
              ],
            ],
          },
        },
        nm_cidade: DataTypes.STRING,
        de_endereco: DataTypes.STRING,
        de_endereco_comp: DataTypes.STRING,
        perfil: {
          type: DataTypes.STRING,
          validate: { isIn: [["administrador", "dentista", "auxiliar", "paciente"]] },
        },
        dt_exclusao: DataTypes.DATE,
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.BancoPessoa, { foreignKey: "pessoa_id", as: "DadosBancarios" });
    this.hasOne(models.Dentista, { foreignKey: "id", as: "Dentista" });
    this.hasOne(models.Auxiliar, { foreignKey: "id", as: "Auxiliar" });
    this.hasOne(models.Paciente, { foreignKey: "id", as: "Paciente" });
  }

  static camposAbertos() {
    return ["nome", "email", "sexo", "perfil", "dt_exclusao"];
  }
  static camposRestritos() {
    return [
      "nr_cpf",
      "dt_nascimento",
      "nr_tel",
      "nr_tel_2",
      "nr_cep",
      "sg_uf",
      "nm_cidade",
      "de_endereco",
      "de_endereco_comp",
    ];
  }
}

module.exports = Pessoa;
