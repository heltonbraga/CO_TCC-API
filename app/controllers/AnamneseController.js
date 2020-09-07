const Erros = require("./Erros.js");
const Validador = require("./Validador.js");
const Anamnese = require("../models/Anamnese");
const Dentista = require("../models/Dentista");

module.exports = {
  /* incluir anamnese */
  async store(params) {
    let user_id = Validador.validarFiltro(params.user, "id");
    let anamnese = Validador.validarAnamnese(params, false);
    try {
      const dentista = await Dentista.findByPk(user_id);
      if (dentista === null) {
        throw new Error(Erros.sohDentista);
      }
      const resultado = await Anamnese.create(anamnese);
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* atualizar anamnese */
  async update(params) {
    let user_id = Validador.validarFiltro(params.user, "id");
    let anamnese = Validador.validarAnamnese(params, true);
    try {
      const dentista = await Dentista.findByPk(user_id);
      if (dentista === null) {
        throw new Error(Erros.sohDentista);
      }
      let anterior = await Anamnese.findByPk(anamnese.id);
      if (anterior === null) {
        throw new Error(Erros.chaveInvalida);
      }
      Validador.merge(anterior, anamnese);
      const resultado = await anterior.save();
      return resultado;
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },
};
