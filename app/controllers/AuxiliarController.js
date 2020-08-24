const { Op } = require("sequelize");
const conn = require("../database");
const Auxiliar = require("../models/Auxiliar.js");
const Pessoa = require("../models/Pessoa.js");
const PessoaController = require("./PessoaController.js");

const Erros = require("./Erros.js");
const Validador = require("./Validador.js");
const BancoPessoa = require("../models/BancoPessoa.js");
const { findByPk } = require("../models/Pessoa.js");

const ordenacoes = ["nome-asc", "nome-desc", "cro-asc", "cro-desc"];
const orderBy = [
  [Pessoa, "nome", "ASC"],
  [Pessoa, "nome", "DESC"],
  ["nr_cro", "ASC"],
  ["nr_cro", "DESC"],
];

const DEFAULT_ORDER = [orderBy[0]];
const DEFAULT_LIMIT = 10;

module.exports = {
  /* consultar todos os auxiliares, incluindo dados pessoais, excluindo dados restritos, com ordenação e paginação */
  async findAll(params) {
    let { order, offset, limit } = Validador.validarPaginacao(params, ordenacoes, orderBy);
    let restritos = await PessoaController.isAdmin(params.admin);
    try {
      const auxiliares = restritos
        ? await Auxiliar.findAndCountAll({
            limit: limit,
            offset: offset,
            include: {
              model: Pessoa,
              as: "Pessoa",
              include: [{ model: BancoPessoa, as: "DadosBancarios" }],
              where: { dt_exclusao: { [Op.is]: null } },
            },
          })
        : await Auxiliar.findAndCountAll({
            order: order,
            limit: limit,
            offset: offset,
            include: {
              model: Pessoa,
              as: "Pessoa",
              attributes: { exclude: Pessoa.camposRestritos() },
              where: { dt_exclusao: { [Op.is]: null } },
            },
          });
      return Validador.formatarResultado(auxiliares, params, "auxiliar");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar auxiliares com filtro e ordenação por nome, incluindo dados pessoais, excluindo dados restritos, limitando os resultados a 10 */
  async findByNome(params) {
    let nome = Validador.validarFiltro(params.nome, "texto");
    try {
      const auxiliares = await Auxiliar.findAndCountAll({
        order: DEFAULT_ORDER,
        limit: DEFAULT_LIMIT,
        include: [
          {
            model: Pessoa,
            as: "Pessoa",
            attributes: { exclude: Pessoa.camposRestritos() },
            where: {
              dt_exclusao: { [Op.is]: null },
              nome: { [Op.like]: nome },
            },
          },
        ],
      });
      return Validador.formatarResultado(auxiliares, params, "auxiliar");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar auxiliar pelo ID com dados pessoais, os dados restritos serão incluídos se for informado um ID de administrador */
  async findById(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      let restritos = await PessoaController.isAdmin(params.admin);
      const auxiliar = await Auxiliar.findByPk(id, {
        include: [
          {
            model: Pessoa,
            as: "Pessoa",
            attributes: { exclude: restritos ? [] : Pessoa.camposRestritos() },
          },
        ],
      });
      return auxiliar;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* incluir auxiliar com relacionamentos */
  async store(params) {
    let auxiliar = Validador.validarAuxiliar(params, false);
    try {
      let admin = await PessoaController.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const resultado = await conn.transaction(async (t) => {
        const pessoa = await Pessoa.create(auxiliar.Pessoa, { transaction: t });
        auxiliar.id = pessoa.id;
        if (auxiliar.Pessoa.DadosBancarios) {
          auxiliar.Pessoa.DadosBancarios.pessoa_id = auxiliar.id;
          const dadosBancarios = await BancoPessoa.create(auxiliar.Pessoa.DadosBancarios, {
            transaction: t,
          });
          pessoa.addDadosBancarios(dadosBancarios);
        }
        const res = await Auxiliar.create(auxiliar, { transaction: t });
        return res;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* atualizar auxiliar com relacionamentos */
  async update(params) {
    let auxiliar = Validador.validarAuxiliar(params, true);
    try {
      let anterior = await Auxiliar.findByPk(auxiliar.id);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      let admin = await PessoaController.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const resultado = await conn.transaction(async (t) => {
        let pessoa = await anterior.getPessoa();
        Validador.merge(pessoa, auxiliar.Pessoa);
        if (auxiliar.Pessoa && auxiliar.Pessoa.DadosBancarios) {
          let dadosBancarios = await pessoa.getDadosBancarios();
          if (dadosBancarios !== null && Array.isArray(dadosBancarios)) {
            dadosBancarios =
              dadosBancarios.length === 0 ? { pessoa_id: pessoa.id } : dadosBancarios[0];
          }
          Validador.merge(dadosBancarios, auxiliar.Pessoa.DadosBancarios);
          dadosBancarios = dadosBancarios.id
            ? await dadosBancarios.save({
                transaction: t,
              })
            : await BancoPessoa.create(dadosBancarios, {
                transaction: t,
              });
        }
        await pessoa.save({ transaction: t });
        Validador.merge(anterior, auxiliar);
        await anterior.save({ transaction: t });
        return auxiliar;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* excluir auxiliar (soft) */
  async delete(params) {
    return await PessoaController.delete(params);
  },

  getOrder() {
    return ordenacoes;
  },
};
