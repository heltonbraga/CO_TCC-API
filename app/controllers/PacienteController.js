const { Op } = require("sequelize");
const conn = require("../database");
const Pessoa = require("../models/Pessoa.js");
const BancoPessoa = require("../models/BancoPessoa.js");
const Paciente = require("../models/Paciente.js");

const Erros = require("./Erros.js");
const Validador = require("./Validador.js");

module.exports = {
  /* consultar todos os pacientes, incluindo dados de contato */
  async findAll(params) {
    try {
      const pacientes = await Paciente.findAndCountAll({
        include: {
          model: Pessoa,
          as: "Pessoa",
          attributes: Pessoa.camposContato(),
          where: { dt_exclusao: { [Op.is]: null } },
        },
      });
      return Validador.formatarResultado(pacientes, params, "paciente");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar paciente pelo ID com dados pessoais */
  async findById(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      const paciente = await Paciente.findByPk(id, {
        include: {
          model: Pessoa,
          as: "Pessoa",
          attributes: Pessoa.camposContato(),
          where: { dt_exclusao: { [Op.is]: null } },
        },
      });
      return paciente;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* incluir paciente com dados pessoais */
  async store(params) {
    let paciente = Validador.validarPaciente(params, false);
    try {
      const resultado = await conn.transaction(async (t) => {
        const pessoa = await Pessoa.create(paciente.Pessoa, { transaction: t });
        paciente.id = pessoa.id;
        const res = await Paciente.create(paciente, { transaction: t });
        return res;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* atualizar paciente com relacionamentos */
  async update(params) {
    let paciente = Validador.validarPaciente(params, true);
    try {
      let anterior = await Paciente.findByPk(paciente.id);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      const resultado = await conn.transaction(async (t) => {
        let pessoa = await anterior.getPessoa();
        Validador.merge(pessoa, paciente.Pessoa);
        await pessoa.save({ transaction: t });
        Validador.merge(anterior, paciente);
        await anterior.save({ transaction: t });
        return paciente;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },
};
