const { QueryTypes } = require("sequelize");
const conn = require("../database");
const Erros = require("./Erros.js");
const Validador = require("./Validador.js");
const PessoaController = require("./PessoaController.js");
const {
  relatHorasPorDentista,
  relatAtdPorConvenio,
  relatAtdPorProcedimento,
  relatAtendimentoPorDia,
  relatCancelamentoPorMotivo,
  relatReagendamentoPorPerfil,
} = require("../database/SQL.js");

module.exports = {
  async relatorio(params) {
    let inicio = Validador.validarFiltro(params.inicio, "data");
    let fim = Validador.validarFiltro(params.fim, "data");
    let user = Validador.validarFiltro(params.user, "id");
    try {
      let isAdm = await PessoaController.isAdmin(user);
      if (!isAdm) {
        throw new Error(Erros.sohAdmin);
      }
      const horasPorDentista = conn.query(relatHorasPorDentista, {
        replacements: { inicio: inicio, fim: fim },
        type: QueryTypes.SELECT,
      });
      const atdPorConvenio = conn.query(relatAtdPorConvenio, {
        replacements: { inicio: inicio, fim: fim },
        type: QueryTypes.SELECT,
      });
      const atdPorProcedimento = conn.query(relatAtdPorProcedimento, {
        replacements: { inicio: inicio, fim: fim },
        type: QueryTypes.SELECT,
      });
      const atendimentoPorDia = conn.query(relatAtendimentoPorDia, {
        replacements: { inicio: inicio, fim: fim },
        type: QueryTypes.SELECT,
      });
      const cancelamentoPorMotivo = conn.query(relatCancelamentoPorMotivo, {
        replacements: { inicio: inicio, fim: fim },
        type: QueryTypes.SELECT,
      });
      const reagendamentoPorPerfil = conn.query(relatReagendamentoPorPerfil, {
        replacements: { inicio: inicio, fim: fim },
        type: QueryTypes.SELECT,
      });
      const [
        resHorasPorDentista,
        resAtdPorConvenio,
        resAtdPorProcedimento,
        resAtendimentoPorDia,
        resCancelamentoPorMotivo,
        resReagendamentoPorPerfil,
      ] = await Promise.all([
        horasPorDentista,
        atdPorConvenio,
        atdPorProcedimento,
        atendimentoPorDia,
        cancelamentoPorMotivo,
        reagendamentoPorPerfil,
      ]);
      let result = {};
      result.horasPorDentista = resHorasPorDentista;
      result.atdPorConvenio = resAtdPorConvenio;
      result.atdPorProcedimento = resAtdPorProcedimento;
      result.atendimentoPorDia = resAtendimentoPorDia;
      result.cancelamentoPorMotivo = resCancelamentoPorMotivo;
      result.reagendamentoPorPerfil = resReagendamentoPorPerfil;
      return result;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },
};
