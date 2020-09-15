const { Op } = require("sequelize");
const conn = require("../database");
const Procedimento = require("../models/Procedimento.js");
const DentistaController = require("./DentistaController.js");
const AtendimentoController = require("./AtendimentoController.js");
const PessoaController = require("./PessoaController.js");

const Erros = require("./Erros.js");
const Validador = require("./Validador.js");

const ordenacoes = [
  "nome-asc",
  "nome-desc",
  "duracao-asc",
  "duracao-desc",
  "dm_tipo-asc",
  "dm_tipo-desc",
  "id-asc",
  "id-desc",
];
const orderBy = [
  ["nome", "ASC"],
  ["nome", "DESC"],
  ["duracao", "ASC"],
  ["duracao", "DESC"],
  ["dm_tipo", "ASC"],
  ["dm_tipo", "DESC"],
  ["id", "ASC"],
  ["id", "DESC"],
];

const DEFAULT_ORDER = [orderBy[0]];
const DEFAULT_LIMIT = 100;

module.exports = {
  /* consultar todos os procedimentos, com ordenação e paginação */
  async findAll(params) {
    let { order, offset, limit } = Validador.validarPaginacao(params, ordenacoes, orderBy);
    try {
      const procedimentos = await Procedimento.findAndCountAll({
        order: order,
        limit: limit,
        offset: offset,
      });
      return Validador.formatarResultado(procedimentos, params, "procedimento");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar todos os procedimentos, com ordenação e paginação */
  async findAllLivres(params) {
    let { order, offset, limit } = Validador.validarPaginacao(params, ordenacoes, orderBy);
    try {
      const procedimentos = await Procedimento.findAndCountAll({
        order: order,
        limit: limit,
        offset: offset,
        where: { dm_tipo: { [Op.eq]: "livre" } },
      });
      return Validador.formatarResultado(procedimentos, params, "procedimento");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar procedimentos com filtro e ordenação por nome, limitando os resultados a 10 */
  async findByNome(params) {
    let nome = Validador.validarFiltro(params.nome, "texto");
    try {
      const procedimentos = await Procedimento.findAndCountAll({
        order: DEFAULT_ORDER,
        limit: DEFAULT_LIMIT,
        where: {
          nome: { [Op.like]: nome },
        },
      });
      return Validador.formatarResultado(procedimentos, params, "procedimento");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar procedimento pelo ID com [totalizador de dentistas que ofertam o procedimento] e [atendimentos agendados para esse procedimento]  */
  async findById(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      const procedimento = await Procedimento.findByPk(id);
      if (procedimento) {
        const dentistas = await DentistaController.findByProcedimento({ procedimento: id });
        const atendimentos = await AtendimentoController.findByProcedimento({
          id: id,
          de: Date.now(),
        });
        return { procedimento: procedimento, oferta: dentistas.total, demanda: atendimentos.total };
      }
      return null;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* incluir procedimento */
  async store(params) {
    let procedimento = Validador.validarProcedimento(params, false);
    try {
      let admin = await PessoaController.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const resultado = await Procedimento.create(procedimento);
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* atualizar procedimento */
  async update(params) {
    let procedimento = Validador.validarProcedimento(params, true);
    try {
      let anterior = await Procedimento.findByPk(procedimento.id);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      let admin = await PessoaController.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      Validador.merge(anterior, procedimento);
      await anterior.save();
      return anterior;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* excluir procedimento */
  async delete(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      let admin = await PessoaController.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const atendimentos = await AtendimentoController.findByProcedimento({
        id: id,
      });
      if (atendimentos.total > 0) {
        throw new Error(Erros.procedimentoVinculado);
      }
      const procedimento = await Procedimento.findByPk(id);
      if (!procedimento) {
        throw new Error(Erros.chaveInvalida);
      }
      return await procedimento.destroy(id);
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  getOrder() {
    return ordenacoes;
  },
};
