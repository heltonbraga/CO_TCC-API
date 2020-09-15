const conn = require("../database");
const Erros = require("./Erros.js");
const Validador = require("./Validador.js");
const Pessoa = require("../models/Pessoa");
const Paciente = require("../models/Paciente");
const Anamnese = require("../models/Anamnese");
const Dentista = require("../models/Dentista");
const Prontuario = require("../models/Prontuario");
const Exame = require("../models/Exame");

module.exports = {
  /* consultar prontuario completo pelo paciente, verificando se solicitante é dentista */
  async findByPaciente(params) {
    let paciente_id = Validador.validarFiltro(params.id, "id");
    let user_id = Validador.validarFiltro(params.user, "id");
    try {
      const dentista = await Dentista.findByPk(user_id);
      if (dentista === null) {
        throw new Error(Erros.sohDentista);
      }
      const paciente = await Paciente.findByPk(paciente_id, {
        include: [
          {
            model: Pessoa,
            as: "Pessoa",
            attributes: Pessoa.camposContato(),
          },
          {
            model: Anamnese,
            as: "Anamnese",
          },
          {
            model: Prontuario,
            as: "Prontuarios",
            include: [{ model: Exame, as: "Exames" }],
          },
        ],
      });
      if (paciente === null) {
        throw new Error(Erros.chaveInvalida);
      }
      return paciente;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar prontuario pelo ID */
  async findById(params) {
    let id = Validador.validarFiltro(params.id, "id");
    let user_id = Validador.validarFiltro(params.user, "id");
    try {
      const dentista = await Dentista.findByPk(user_id);
      if (dentista === null) {
        throw new Error(Erros.sohDentista);
      }
      const prontuario = await Prontuario.findByPk(id);
      return prontuario;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* incluir prontuario */
  async store(params) {
    let user_id = Validador.validarFiltro(params.user, "id");
    let prontuario = Validador.validarProntuario(params.prontuario, false);
    try {
      const dentista = await Dentista.findByPk(user_id);
      if (dentista === null) {
        throw new Error(Erros.sohDentista);
      }
      const resultado = await conn.transaction(async (t) => {
        const res = await Prontuario.create(prontuario, { transaction: t });
        if (prontuario.Exames && prontuario.Exames.length > 0) {
          prontuario.Exames.forEach((e) => {
            e.prontuario_id = res.id;
          });
          const exames = await Exame.bulkCreate(prontuario.Exames, {
            transaction: t,
          });
          res.addExames(exames);
        }
        return res;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* atualizar prontuario */
  async update(params) {
    let user_id = Validador.validarFiltro(params.user, "id");
    let prontuario = Validador.validarProntuario(params, true);
    try {
      const dentista = await Dentista.findByPk(user_id);
      if (dentista === null) {
        throw new Error(Erros.sohDentista);
      }
      let anterior = await Prontuario.findByPk(prontuario.id);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      Validador.merge(anterior, prontuario);
      const resultado = await conn.transaction(async (t) => {
        await anterior.save({ transaction: t });
        if (params.exames) {
          //await Exame.destroy({ where: { prontuario_id: anterior.id } }, { transaction: t });
          await Exame.bulkCreate(prontuario.Exames, {
            transaction: t,
          });
        }
        return prontuario;
      });
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },
};
