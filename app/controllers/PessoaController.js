const { Op } = require("sequelize");
const Pessoa = require("../models/Pessoa.js");
const BancoPessoa = require("../models/BancoPessoa.js");

const Erros = require("./Erros.js");
const Validador = require("./Validador.js");

module.exports = {
  /* verifica se o ID informado é de um administrador */
  async isAdmin(parametro) {
    if (!parametro) {
      return false;
    }
    let id = parseInt(parametro);
    if (isNaN(id) || id < 1) {
      throw new Error(Erros.erroParametrosInvalidos);
    }
    let admin = await Pessoa.findOne({
      where: { id: id, dt_exclusao: { [Op.is]: null }, perfil: "administrador" },
    });
    return admin !== null;
  },

  /* excluir pessoa (soft) */
  async delete(params) {
    let id = Validador.validarFiltro(params.id, "id");
    try {
      let admin = await this.isAdmin(params.admin);
      if (!admin) {
        throw new Error(Erros.sohAdmin);
      }
      const pessoa = await Pessoa.update({ dt_exclusao: Date.now() }, { where: { id: id } });
      return pessoa;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },
};
