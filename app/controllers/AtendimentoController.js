const { Op } = require("sequelize");

const Erros = require("./Erros.js");
const Validador = require("./Validador.js");

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
};
