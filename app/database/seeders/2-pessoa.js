"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "pessoa",
      [
        {
          nome: "Helton Fabrício Braga",
          email: "helton.braga@gmail.com",
          nr_cpf: 7427328,
          sexo: "M",
          dt_nascimento: "1983-05-14",
          nr_tel: "85991098943",
          nr_cep: 60110300,
          sg_uf: "CE",
          nm_cidade: "Fortaleza",
          de_endereco: "Rua João Cordeiro 1100, Centro",
          de_endereco_comp: "ap 1001",
          perfil: "administrador",
        },
        {
          nome: "Maria Elisa Martins Moura",
          email: "mariaelisa.martins@hotmail.com",
          nr_cpf: 4338209348,
          sexo: "F",
          dt_nascimento: "1990-07-29",
          nr_tel: "85991098943",
          nr_cep: 60110300,
          sg_uf: "CE",
          nm_cidade: "Fortaleza",
          de_endereco: "Rua João Cordeiro 1100, Centro",
          de_endereco_comp: "ap 1001",
          perfil: "dentista",
        },
        {
          nome: "Mirian Freitas Martins Moura",
          email: "mirianfreitas@hotmail.com",
          nr_cpf: 4338209348,
          sexo: "F",
          dt_nascimento: "1960-06-12",
          nr_tel: "85991098943",
          nr_cep: 60110300,
          sg_uf: "CE",
          nm_cidade: "Fortaleza",
          de_endereco: "Rua Pinto Madeira 757, Centro",
          de_endereco_comp: "ap 302",
          perfil: "auxiliar",
        },
        {
          nome: "Rita de Cássia do Nascimento",
          email: "cassia.1956@gmail.com",
          nr_cpf: 14132770397,
          sexo: "F",
          dt_nascimento: "1956-01-24",
          nr_tel: "85981356776",
          nr_cep: 60320490,
          sg_uf: "CE",
          nm_cidade: "Fortaleza",
          de_endereco: "Rua José Cândido 486, Monte Castelo",
          perfil: "paciente",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("pessoa", null, {});
  },
};
