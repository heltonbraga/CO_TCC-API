const { Op, QueryTypes, sequelize } = require("sequelize");
const conn = require("../database");
const moment = require("moment");
const Erros = require("./Erros.js");
const Validador = require("./Validador.js");
const PessoaController = require("./PessoaController.js");
const Atendimento = require("../models/Atendimento.js");
const {
  findVaga,
  findVagaExt,
  findVagaCalendario,
  findByProcedimento,
  checkAtendimento,
  atendimentoAnterior,
} = require("../database/SQL.js");
const Procedimento = require("../models/Procedimento");
const Paciente = require("../models/Paciente");
const Dentista = require("../models/Dentista");
const Pessoa = require("../models/Pessoa");
const LogAtendimento = require("../models/LogAtendimento");

const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sabado"];
module.exports = {
  /*  */
  async findByProcedimento(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      let filtro1 = { procedimento_id: { [Op.eq]: id } };
      let filtro2 = { dt_horario: { [Op.gte]: moment().format("YYYY-MM-DD") } };
      let filtro3 = { dm_situacao: { [Op.ne]: "cancelado" } };
      const atds = await Atendimento.findAndCountAll({
        where: { [Op.and]: [filtro1, filtro2, filtro3] },
      });
      return Validador.formatarResultado(atds, params, "atendimento");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /*  */
  async findByDentista(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      let filtro1 = { dentista_id: { [Op.eq]: id } };
      let filtro2 = { dt_horario: { [Op.gte]: moment().format("YYYY-MM-DD") } };
      let filtro3 = { dm_situacao: { [Op.ne]: "cancelado" } };
      const atds = await Atendimento.findAndCountAll({
        where: { [Op.and]: [filtro1, filtro2, filtro3] },
      });
      return Validador.formatarResultado(atds, params, "atendimento");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar atendimento pelo ID */
  async findById(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      const atendimento = await Atendimento.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: "Paciente",
            include: {
              model: Pessoa,
              as: "Pessoa",
              attributes: Pessoa.camposContato(),
            },
          },
          {
            model: Dentista,
            as: "Dentista",
            include: {
              model: Pessoa,
              as: "Pessoa",
              attributes: Pessoa.camposContato(),
            },
          },
          {
            model: Procedimento,
            as: "Procedimento",
          },
          {
            model: Atendimento,
            as: "AtendimentoAnterior",
          },
        ],
      });
      return atendimento;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar log de atendimento pelo ID do atendimento */
  async findLog(params) {
    let id = Validador.validarFiltro(params.id, "id");
    let user = Validador.validarFiltro(params.user, "id");
    try {
      let admin = await PessoaController.isAdmin(user);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const atendimento = await Atendimento.findByPk(id);
      if (atendimento === null) {
        throw new Error(Erros.chaveInvalida);
      }
      const logs = await LogAtendimento.findAll({
        include: {
          model: Pessoa,
          as: "Pessoa",
          attributes: Pessoa.camposContato(),
        },
        where: { atendimento_id: { [Op.eq]: id } },
      });
      return logs;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* Busca atendimentos por filtro de data e dentista (opcional quando solicitação de admin) */
  async findByFilter(params) {
    Validador.validarFiltro(params.user, "id");
    let dia = Validador.validarFiltro(params.dia, "data");
    let dentista = parseInt(params.dentista);
    try {
      let isAdm = await PessoaController.isAdmin(params.user);
      if (!isAdm) {
        //Validador.validarFiltro(params.dentista, "id");
        if (params.dentista !== params.user) {
          //throw new Error(Erros.sohAdmin);
        }
      }
      const atendimentos =
        dentista === 0
          ? await Atendimento.findAndCountAll({
              include: [
                {
                  model: Paciente,
                  as: "Paciente",
                  include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
                },
                {
                  model: Dentista,
                  as: "Dentista",
                  include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
                },
                {
                  model: Procedimento,
                  as: "Procedimento",
                },
              ],
              where: conn.where(conn.fn("DATE", conn.col("dt_horario")), dia),
            })
          : await Atendimento.findAndCountAll({
              include: [
                {
                  model: Paciente,
                  as: "Paciente",
                  include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
                },
                {
                  model: Dentista,
                  as: "Dentista",
                  include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
                },
                {
                  model: Procedimento,
                  as: "Procedimento",
                },
              ],
              where: {
                [Op.and]: [
                  { dentista_id: { [Op.eq]: dentista } },
                  conn.where(conn.fn("DATE", conn.col("dt_horario")), dia),
                ],
              },
            });
      return Validador.formatarResultado(atendimentos, params, "atendimento");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* Busca atendimentos por mês e dentista */
  async findByMes(params) {
    let dia = Validador.validarFiltro(params.dia, "data");
    const inicio = moment(dia).startOf("month").format("YYYY-MM-DD");
    const fim = moment(dia).endOf("month").format("YYYY-MM-DD");
    let dentista = parseInt(params.dentista);
    try {
      let filter = conn.where(conn.fn("DATE", conn.col("dt_horario")), {
        [Op.between]: [inicio, fim],
      });
      if (dentista !== 0) {
        filter = { $and: [filter, { dentista_id: { [Op.eq]: dentista } }] };
      }
      const atendimentos = await Atendimento.findAndCountAll({
        include: [
          {
            model: Paciente,
            as: "Paciente",
            include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
          },
          {
            model: Dentista,
            as: "Dentista",
            include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
          },
          {
            model: Procedimento,
            as: "Procedimento",
          },
        ],
        where: filter,
      });
      return Validador.formatarResultado(atendimentos, params, "atendimento");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  async findUltimoEProximo(params) {
    const id = Validador.validarFiltro(params.id, "id");
    try {
      const ultimo = await Atendimento.findOne({
        include: [
          {
            model: Paciente,
            as: "Paciente",
            include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
          },
          {
            model: Dentista,
            as: "Dentista",
            include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
          },
          {
            model: Procedimento,
            as: "Procedimento",
          },
        ],
        where: {
          [Op.and]: [
            { paciente_id: { [Op.eq]: id } },
            { dm_situacao: { [Op.eq]: "realizado" } },
            { dt_horario: { [Op.lt]: moment().add(-3, "hours").format("YYYY-MM-DD HH:mm:ss") } },
          ],
        },
        order: [["dt_horario", "DESC"]],
      });
      const proximo = await Atendimento.findOne({
        include: [
          {
            model: Paciente,
            as: "Paciente",
            include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
          },
          {
            model: Dentista,
            as: "Dentista",
            include: [{ model: Pessoa, as: "Pessoa", attributes: Pessoa.camposContato() }],
          },
          {
            model: Procedimento,
            as: "Procedimento",
          },
        ],
        where: {
          [Op.and]: [
            { paciente_id: { [Op.eq]: id } },
            { dm_situacao: { [Op.in]: ["agendado", "confirmado"] } },
            { dt_horario: { [Op.gte]: moment().add(-3, "hours").format("YYYY-MM-DD HH:mm:ss") } },
          ],
        },
        order: [["dt_horario", "ASC"]],
      });
      return { ultimo: ultimo, proximo: proximo };
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* Busca vagas para atendimento de um procedimento em uma data, 
  podendo ou não limitar a um dentista. 
  A flag "extremos" indica se devem ser retornadas todas as vagas ou 
  apenas aquelas dos extremos de disponibilidade (primeira e última 
  de cada turno de cada dentista ) */
  async findVaga(params) {
    console.log((new Date()).getTimezoneOffset());
    const proc = Validador.validarFiltro(params.procedimento, "id");
    const dia = Validador.validarFiltro(params.dia, "data");
    if (!moment(dia, "YYYY-MM-DD", true).isValid()) {
      throw new Error(Erros.erroParametrosInvalidos);
    }
    const diasemana = dias[moment(dia).weekday()];
    const dent = params.dentista;
    const sql = params.extremos ? findVagaExt : findVaga;
    const sqlParam = { proc: proc, dent: dent, dia: dia, diasemana: diasemana };
    console.log(sqlParam);
    try {
      const vagas = await conn.query(sql, {
        replacements: sqlParam,
        type: QueryTypes.SELECT,
      });
      return Validador.formatarVagas(vagas, params);
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* Busca todas as vagas dos próximos 31 dias para o 
  procedimento e dentista (opcional)  */
  async findVagaCalendario(params) {
    const proc = Validador.validarFiltro(params.procedimento, "id");
    const dent = params.dentista;
    try {
      const vagas = await conn.query(findVagaCalendario, {
        replacements: { proc: proc, dent: dent },
        type: QueryTypes.SELECT,
      });
      return Validador.formatarVagasCalendario(vagas);
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* marcar atendimento */
  async store(params) {
    let atendimento = Validador.validarAtendimento(params, false);
    atendimento.dm_situacao = "agendado";
    try {
      const sqlParam = {
        proc: atendimento.procedimento_id,
        dent: atendimento.dentista_id,
        dia: atendimento.dt_horario,
        diasemana: dias[moment(atendimento.dt_horario).weekday()],
        pac: atendimento.paciente_id,
        id: 0,
      };
      const vaga = await conn.query(checkAtendimento, {
        replacements: sqlParam,
        type: QueryTypes.SELECT,
      });
      if (!vaga || vaga.length === 0) {
        throw new Error(Erros.horarioIndisponivel);
      }
      atendimento.disponibilidade_id = vaga[0].disponibilidade_id;

      const anterior = await conn.query(atendimentoAnterior, {
        replacements: {
          pac: atendimento.paciente_id,
          hora: atendimento.dt_horario,
        },
        type: QueryTypes.SELECT,
      });
      if (anterior && anterior.length > 0) {
        atendimento.anterior_id = anterior[0].id;
      }

      const resultado = await conn.transaction(async (t) => {
        let pac = await Paciente.findByPk(atendimento.paciente_id);
        pac.dm_situacao = "agendado";
        pac.save();
        let atd = await Atendimento.create(atendimento);
        LogAtendimento.create({
          acao: "agendamento",
          dt_acao: moment(),
          pessoa_id: params.user,
          atendimento_id: atd.id,
        });
        return atd;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* cancelar atendimento */
  async cancelar(params) {
    let atendimento = Validador.validarFiltro(params.id, "id");
    let pessoa = Validador.validarFiltro(params.user, "id");
    try {
      let anterior = await Atendimento.findByPk(atendimento);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      anterior.dm_situacao = "cancelado";
      await anterior.save();
      LogAtendimento.create({
        acao: "cancelamento",
        dt_acao: moment(),
        complemento: params.motivo,
        pessoa_id: pessoa,
        atendimento_id: atendimento,
      });
      return anterior;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* confirmar atendimento */
  async confirmar(params) {
    let atendimento = Validador.validarFiltro(params.id, "id");
    let pessoa = Validador.validarFiltro(params.user, "id");
    try {
      let anterior = await Atendimento.findByPk(atendimento);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      anterior.dm_situacao = "confirmado";
      await anterior.save();
      LogAtendimento.create({
        acao: "confirmacao",
        dt_acao: moment(),
        pessoa_id: pessoa,
        atendimento_id: atendimento,
      });
      return anterior;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* realizar atendimento */
  async realizar(params) {
    let atendimento = Validador.validarFiltro(params.id, "id");
    let pessoa = Validador.validarFiltro(params.user, "id");
    try {
      let anterior = await Atendimento.findByPk(atendimento);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      anterior.dm_situacao = "realizado";
      await anterior.save();
      LogAtendimento.create({
        acao: "realizacao",
        dt_acao: moment(),
        pessoa_id: pessoa,
        atendimento_id: atendimento,
      });
      return anterior;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* marcar atendimento */
  async remarcar(params) {
    let atendimento = Validador.validarAtendimento(params, true);
    atendimento.dm_situacao = "agendado";
    try {
      const vaga = await conn.query(checkAtendimento, {
        replacements: {
          proc: atendimento.procedimento_id,
          dent: atendimento.dentista_id,
          dia: atendimento.dt_horario,
          diasemana: dias[moment(atendimento.dt_horario).weekday()],
          pac: atendimento.paciente_id,
          id: atendimento.id,
        },
        type: QueryTypes.SELECT,
      });
      if (!vaga || vaga.length === 0) {
        throw new Error(Erros.erroParametrosInvalidos);
      }
      atendimento.disponibilidade_id = vaga[0].disponibilidade_id;

      let original = await Atendimento.findByPk(atendimento.id);
      if (original === null) {
        throw new Error(Erros.chaveInvalida);
      }

      const resultado = await conn.transaction(async (t) => {
        Validador.merge(original, atendimento);
        await original.save({ transaction: t });

        LogAtendimento.create({
          acao: "reagendamento",
          dt_acao: moment(),
          pessoa_id: params.user,
          atendimento_id: original.id,
        });
        return original;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },
};
