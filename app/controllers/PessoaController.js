const { Op } = require("sequelize");
const Pessoa = require("../models/Pessoa.js");

const Erros = require("./Erros.js");
const Validador = require("./Validador.js");

require("dotenv/config");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTHTOKEN
);

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

  /* buscar perfil a partir do email */
  async getPerfil(params) {
    let email = Validador.validarFiltro(params.email, "email");
    try {
      const pessoa = await Pessoa.findOne({
        where: { email: email, dt_exclusao: { [Op.is]: null } },
      });
      if (!pessoa) {
        throw new Error(Erros.chaveInvalida);
      }
      return { id: pessoa.id, perfil: pessoa.perfil, email: pessoa.email };
    } catch (erro) {
      console.log(erro);
      throw new Error(erro);
    }
  },

  /* verificação de contato de usuário */
  async verificar(params) {
    /*let expect = params.code ? "approved" : "pending";
    let data = params.code
      ? await twilioClient.verify
          .services(process.env.TWILIO_SERVICE_SID)
          .verificationChecks.create({ to: "+55" + params.tel, code: params.code })
      : await twilioClient.verify
          .services(process.env.TWILIO_SERVICE_SID)
          .verifications.create({ to: "+55" + params.tel, channel: "sms" });
    if (!data || data.status !== expect) {
      throw new Error(data);
    }
    return data;*/
    return { success: true };
  },
};
