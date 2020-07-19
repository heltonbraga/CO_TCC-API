const { Op, QueryTypes } = require("sequelize");
const conn = require("../database");

const Dentista = require("../models/Dentista.js");
const Pessoa = require("../models/Pessoa.js");
const BancoPessoa = require("../models/BancoPessoa.js");
const Procedimento = require("../models/Procedimento.js");
const Disponibilidade = require("../models/Disponibilidade.js");

const PessoaController = require("./PessoaController.js");
const AtendimentoController = require("./AtendimentoController.js");

const Erros = require("./Erros.js");
const Validador = require("./Validador.js");
const SQL = require("../database/SQL.js");

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
  /* consultar todos os dentistas, incluindo dados pessoais, excluindo dados restritos, com ordenação e paginação */
  async findAll(params) {
    let { order, offset, limit } = Validador.validarPaginacao(params);
    try {
      const dentistas = await Dentista.findAndCountAll({
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
      return Validador.formatarResultado(dentistas, params, "dentista");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar dentistas com filtro e ordenação por nome, incluindo dados pessoais, excluindo dados restritos, limitando os resultados a 10 */
  async findByNome(params) {
    let nome = Validador.validarFiltro(params.nome, "texto");
    try {
      const dentistas = await Dentista.findAndCountAll({
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
      return Validador.formatarResultado(dentistas, params, "dentista");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar dentistas pelo procedimento oferecido, incluindo dados pessoais, excluindo dados restritos, limitando os resultados a 10 */
  async findByProcedimento(params) {
    let nome = Validador.validarFiltro(params.procedimento, "texto_exato");
    try {
      const dentistas = await Dentista.findAndCountAll({
        limit: DEFAULT_LIMIT,
        include: [
          {
            model: Procedimento,
            as: "Procedimentos",
            where: {
              nome: { [Op.eq]: nome },
            },
          },
          {
            model: Pessoa,
            as: "Pessoa",
            attributes: { exclude: Pessoa.camposRestritos() },
            where: {
              dt_exclusao: { [Op.is]: null },
            },
          },
        ],
      });
      return Validador.formatarResultado(dentistas, params, "dentista");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar dentistas pela disponibilidade, incluindo dados pessoais, excluindo dados restritos, limitando os resultados a 10 */
  async findByDisp(params) {
    let dia = Validador.validarFiltro(params.dia, "texto_exato");
    let hora = Validador.validarFiltro(params.hora, "hora");
    try {
      const dentistas = await Dentista.findAndCountAll({
        limit: DEFAULT_LIMIT,
        include: [
          {
            model: Disponibilidade,
            as: "Disponibilidades",
            where: {
              dm_dia_semana: { [Op.eq]: dia },
              hr_inicio: { [Op.lte]: hora },
              hr_fim: { [Op.gt]: hora },
            },
          },
          {
            model: Pessoa,
            as: "Pessoa",
            attributes: { exclude: Pessoa.camposRestritos() },
            where: {
              dt_exclusao: { [Op.is]: null },
            },
          },
        ],
      });
      return Validador.formatarResultado(dentistas, params, "dentista");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar dentista pelo ID com procedimentos, disponibilidade e dados pessoais, os dados restritos serão incluídos se for informado um ID de administrador */
  async findById(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      let restritos = await PessoaController.isAdmin(params.admin);
      const dentista = await Dentista.findByPk(id, {
        include: [
          {
            model: Disponibilidade,
            as: "Disponibilidades",
          },
          {
            model: Procedimento,
            as: "Procedimentos",
          },
          {
            model: Pessoa,
            as: "Pessoa",
            attributes: { exclude: restritos ? [] : Pessoa.camposRestritos() },
          },
        ],
      });
      return dentista;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* incluir dentista com relacionamentos */
  async store(params) {
    let dentista = Validador.validarDentista(params, false);
    try {
      let admin = await PessoaController.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const resultado = await conn.transaction(async (t) => {
        const pessoa = await Pessoa.create(dentista.Pessoa, { transaction: t });
        dentista.id = pessoa.id;
        if (dentista.Pessoa.DadosBancarios) {
          dentista.Pessoa.DadosBancarios.pessoa_id = dentista.id;
          const dadosBancarios = await BancoPessoa.create(dentista.Pessoa.DadosBancarios, {
            transaction: t,
          });
          pessoa.addDadosBancarios(dadosBancarios);
        }
        const res = await Dentista.create(dentista, { transaction: t });
        if (dentista.Procedimentos && dentista.Procedimentos.length > 0) {
          await res.addProcedimentos(
            dentista.Procedimentos.map((proc) => {
              return proc.procedimento_id;
            }),
            { transaction: t }
          );
        }
        if (dentista.Disponibilidades && dentista.Disponibilidades.length > 0) {
          dentista.Disponibilidades.forEach((disp) => {
            disp.dentista_id = dentista.id;
          });
          const disponibilidades = await Disponibilidade.bulkCreate(dentista.Disponibilidades, {
            transaction: t,
          });
          res.addDisponibilidades(disponibilidades);
        }
        return res;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* atualizar dentista com relacionamentos */
  async update(params) {
    let dentista = Validador.validarDentista(params, true);
    try {
      let anterior = await Dentista.findByPk(dentista.id);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      let admin = await PessoaController.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const resultado = await conn.transaction(async (t) => {
        let pessoa = await anterior.getPessoa();
        Validador.merge(pessoa, dentista.Pessoa);
        if (dentista.Pessoa && dentista.Pessoa.DadosBancarios) {
          let dadosBancarios = await pessoa.getDadosBancarios();
          if (dadosBancarios !== null && Array.isArray(dadosBancarios)) {
            dadosBancarios =
              dadosBancarios.length === 0 ? { pessoa_id: pessoa.id } : dadosBancarios[0];
          }
          Validador.merge(dadosBancarios, dentista.Pessoa.DadosBancarios);
          dadosBancarios = dadosBancarios.id
            ? await dadosBancarios.save({
                transaction: t,
              })
            : await BancoPessoa.create(dadosBancarios, {
                transaction: t,
              });
        }
        await pessoa.save({ transaction: t });
        Validador.merge(anterior, dentista);
        await anterior.save({ transaction: t });
        if (params.disponibilidades) {
          await Disponibilidade.destroy({ where: { dentista_id: dentista.id }, transaction: t });
          await Disponibilidade.bulkCreate(dentista.Disponibilidades, {
            transaction: t,
          });
          const total = await conn.query(SQL.countAtendimentosSemDisponibilidade, {
            replacements: { id: anterior.id },
            type: QueryTypes.SELECT,
          });
          if (total[0].total > 0) {
            throw new Error(Erros.conflitoDispAtend);
          }
        }
        if (params.procedimentos) {
          let proc = dentista.Procedimentos.map((proc) => {
            return proc.procedimento_id;
          });
          await anterior.setProcedimentos(proc, { transaction: t });
        }
        return dentista;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* excluir dentista (soft) */
  async delete(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      let admin = await PessoaController.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const atendimentos = await AtendimentoController.findByDentista({
        dentista: id,
      });
      if (atendimentos.total > 0) {
        throw new Error(Erros.dentistaVinculado);
      }
      return await PessoaController.delete(params);
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  getOrder() {
    return ordenacoes;
  },
};
