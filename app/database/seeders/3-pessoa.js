"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "pessoa",
      [
        {
          nome: "Vilana",
          email: "vilana@gmail.com",
          nr_cpf: 11122233344,
          sexo: "F",
          dt_nascimento: "1988-07-13",
          nr_tel: "85999998888",
          nr_cep: 60000000,
          sg_uf: "CE",
          nm_cidade: "Fortaleza",
          de_endereco: "Rua X, Aldeota",
          de_endereco_comp: "ap 101",
          perfil: "dentista",
        },
        {
          nome: "Ernanda",
          email: "ernanda@gmail.com",
          nr_cpf: 11122233344,
          sexo: "F",
          dt_nascimento: "1988-07-13",
          nr_tel: "85999998888",
          nr_cep: 60000000,
          sg_uf: "CE",
          nm_cidade: "Fortaleza",
          de_endereco: "Rua X, Aldeota",
          de_endereco_comp: "ap 101",
          perfil: "dentista",
        },
        {
          nome: "Fávia",
          email: "flavia@gmail.com",
          nr_cpf: 11122233344,
          sexo: "F",
          dt_nascimento: "1988-07-13",
          nr_tel: "85999998888",
          nr_cep: 60000000,
          sg_uf: "CE",
          nm_cidade: "Fortaleza",
          de_endereco: "Rua X, Aldeota",
          de_endereco_comp: "ap 101",
          perfil: "dentista",
        },
        {
          nome: "Felipe",
          email: "felipe@gmail.com",
          nr_cpf: 11122233344,
          sexo: "M",
          dt_nascimento: "1988-07-13",
          nr_tel: "85999998888",
          nr_cep: 60000000,
          sg_uf: "CE",
          nm_cidade: "Fortaleza",
          de_endereco: "Rua X, Aldeota",
          de_endereco_comp: "ap 101",
          perfil: "dentista",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("pessoa", null, {});
  },
};
