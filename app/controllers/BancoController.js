const Banco = require("../models/Banco.js");
const Validador = require("./Validador.js");

module.exports = {
  /* consultar todos os bancos */
  async findAll() {
    try {
      const bancos = await Banco.findAndCountAll();
      return Validador.formatarResultado(bancos, {}, "banco");
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* consultar banco pelo ID */
  async findById(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      return await Banco.findByPk(id);
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },
};
