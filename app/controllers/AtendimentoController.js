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
    //TODO
    return Validador.formatarResultado({ rows: [], count: 0 }, params, "atendimento");
  },

  /*  */
  async findByDentista(params) {
    //TODO
    return Validador.formatarResultado({ rows: [], count: 0 }, params, "atendimento");
  },

  /* */
  async findByFilter(params) {
    Validador.validarFiltro(params.user, "id");
    let dia = Validador.validarFiltro(params.dia, "data");
    let dentista = parseInt(params.dentista);
    try {
      let isAdm = await PessoaController.isAdmin(params.user);
      if (!isAdm) {
        Validador.validarFiltro(params.dentista, "id");
        if (params.dentista !== params.user) {
          throw new Error(Erros.sohAdmin);
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

  /*  */
  async findVaga(params) {
    const proc = Validador.validarFiltro(params.procedimento, "id");
    const dia = Validador.validarFiltro(params.dia, "data");
    if (!moment(dia, "YYYY-MM-DD", true).isValid()) {
      throw new Error(Erros.erroParametrosInvalidos);
    }
    const diasemana = dias[moment(dia).weekday()];
    const dent = params.dentista;
    const sql = params.extremos ? findVagaExt : findVaga;
    try {
      const vagas = await conn.query(sql, {
        replacements: { proc: proc, dent: dent, dia: dia, diasemana: diasemana },
        type: QueryTypes.SELECT,
      });
      return Validador.formatarVagas(vagas, params);
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /*  */
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
      const vaga = await conn.query(checkAtendimento, {
        replacements: {
          proc: atendimento.procedimento_id,
          dent: atendimento.dentista_id,
          dia: atendimento.dt_horario,
          diasemana: dias[moment(atendimento.dt_horario).weekday()],
          pac: atendimento.paciente_id,
          id: 0,
        },
        type: QueryTypes.SELECT,
      });
      if (!vaga || vaga.length === 0) {
        throw new Error(Erros.erroParametrosInvalidos);
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
};
