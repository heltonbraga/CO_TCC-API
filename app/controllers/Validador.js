const Erros = require("./Erros.js");

module.exports = {
  formatarResultado(colecao, params, model) {
    return {
      entidade: model,
      parametros: params,
      total: colecao.count,
      quantidade: colecao.rows.length,
      registros: colecao.rows,
    };
  },

  merge(ori, atu) {
    if (!ori || (Array.isArray(ori) && ori.length === 0)) {
      ori = atu;
    } else if (atu) {
      Object.keys(atu).forEach((att) => {
        if (atu[att] && (!ori[att] || typeof ori[att] === undefined || ori[att] !== atu[att])) {
          ori[att] = atu[att];
        }
      });
    }
  },

  temConflito(d1, d2) {
    if (d1.dm_dia_semana === d2.dm_dia_semana) {
      let ini1 = parseInt(d1.hr_inicio.split(":").join(""));
      let fim1 = parseInt(d1.hr_fim.split(":").join(""));
      let ini2 = parseInt(d2.hr_inicio.split(":").join(""));
      let fim2 = parseInt(d2.hr_fim.split(":").join(""));
      return ini1 < fim2 && fim1 > ini2;
    }
    return false;
  },

  validarDisponibilidade(params, id) {
    if (!params || !params.dm_dia_semana || !params.hr_inicio || !params.hr_fim) {
      throw new Error(Erros.erroParametrosInsuficientes);
    }
    let disponibilidade = {
      dentista_id: id,
      dm_dia_semana: params.dm_dia_semana,
      hr_inicio: this.validarFiltro(params.hr_inicio, "hora"),
      hr_fim: this.validarFiltro(params.hr_fim, "hora"),
    };
    if (
      parseInt(disponibilidade.hr_inicio.split(":").join("")) >=
      parseInt(disponibilidade.hr_fim.split(":").join(""))
    ) {
      throw new Error(Erros.horariosConflitantes);
    }
    return disponibilidade;
  },

  validarDisponibilidades(params, id) {
    let disponibilidades = [];
    if (params && params.length > 0) {
      params.forEach((param) => disponibilidades.push(this.validarDisponibilidade(param, id)));
    }
    for (let i = 0; i < disponibilidades.length - 1; i++) {
      let d1 = disponibilidades[i];
      for (let j = i + 1; j < disponibilidades.length; j++) {
        let d2 = disponibilidades[j];
        if (temConflito(d1, d2)) {
          throw new Error(Erros.conflitoDisponibilidade);
        }
      }
    }
    return disponibilidades;
  },

  validarProcedimentoDentista(params) {
    if (!params || !params.procedimento_id) {
      throw new Error(Erros.erroParametrosInsuficientes);
    }
    let procedimentoDentista = {
      procedimento_id: params.procedimento_id,
    };
    return procedimentoDentista;
  },

  validarProcedimentosDentistas(params) {
    let procedimentos = [];
    if (params && params.length > 0) {
      params.forEach((param) => procedimentos.push(this.validarProcedimentoDentista(param)));
    }
    return procedimentos;
  },

  validarDentista(params, id = false) {
    if (!params || (!id && !params.nr_cro) || (id && !params.id)) {
      throw new Error(Erros.erroParametrosInsuficientes);
    }
    let pessoa =
      !id || params.pessoa ? this.validarPessoa(params.pessoa, "dentista", id) : undefined;
    let disponibilidades = this.validarDisponibilidades(params.disponibilidades, params.id);
    let procedimentos = this.validarProcedimentosDentistas(params.procedimentos);
    let dentista = {
      id: params.id,
      nr_cro: params.nr_cro,
      dt_liberacao: params.dt_liberacao,
      dt_bloqueio: params.dt_bloqueio,
      Pessoa: pessoa,
      Disponibilidades: disponibilidades,
      Procedimentos: procedimentos,
    };
    return dentista;
  },

  validarPaginacao(params, ordenacoes, orderBy) {
    if (!params || !params.page || !params.pagesize || !params.order) {
      throw new Error(Erros.erroParametrosInsuficientes);
    }
    let page = parseInt(params.page);
    let pagesize = parseInt(params.pagesize);
    if (
      isNaN(page) ||
      page < 1 ||
      isNaN(pagesize) ||
      pagesize < 1 ||
      ordenacoes.indexOf(params.order) < 0
    ) {
      throw new Error(Erros.erroParametrosInvalidos);
    }
    return {
      order: [orderBy[ordenacoes.indexOf(params.order)]],
      offset: (page - 1) * pagesize,
      limit: pagesize,
    };
  },

  validarFiltro(parametro, forma) {
    let param = parametro;
    if (!parametro) {
      throw new Error(Erros.erroParametrosInvalidos);
    }
    if (forma === "texto") {
      param = "%" + parametro + "%";
    }
    if (forma === "hora") {
      let partes = String(param).split(":");
      partes.push("00");
      partes.push("00");
      partes.push("00");
      partes = partes.slice(0, 3);
      let h = parseInt(partes[0]);
      let m = parseInt(partes[1]);
      let s = parseInt(partes[2]);
      if (isNaN(h) || isNaN(m) || isNaN(s) || h > 23 || m > 59 || s != 0) {
        throw new Error(Erros.erroParametrosInvalidos);
      }
      param = partes.join(":");
    }
    if (forma === "id") {
      param = parseInt(param);
      if (isNaN(param) || param < 1) {
        throw new Error(Erros.erroParametrosInvalidos);
      }
    }
    return param;
  },

  /* */
  validarDadosBancarios(params) {
    if (!params || !params.agencia || !params.conta) {
      throw new Error(Erros.erroParametrosInsuficientes);
    }
    let bancoPessoa = {
      id: params.id,
      pessoa_id: params.pessoa_id,
      banco_codigo: params.banco,
      agencia: params.agencia,
      conta: params.conta,
    };
    return bancoPessoa;
  },

  /* */
  validarPessoa(params, perfil, id = false) {
    if (!params || (id && !params.id) || (!id && !params.nome) || (!id && !params.email)) {
      throw new Error(Erros.erroParametrosInsuficientes);
    }
    let dadosBancarios = params.dadosBancarios
      ? this.validarDadosBancarios(params.dadosBancarios)
      : null;
    let pessoa = {
      id: params.id,
      nome: params.nome,
      email: params.email,
      nr_cpf: params.nr_cpf,
      sexo: params.sexo,
      dt_nascimento: params.dt_nascimento,
      nr_tel: params.nr_tel,
      nr_tel_2: params.nr_tel_2,
      nr_cep: params.nr_cep,
      sg_uf: params.sg_uf,
      nm_cidade: params.nm_cidade,
      de_endereco: params.de_endereco,
      de_endereco_comp: params.de_endereco_comp,
      perfil: perfil,
      dt_exclusao: params.dt_exclusao,
      DadosBancarios: dadosBancarios,
    };
    return pessoa;
  },

  /* */
  validarProcedimento(params, id = false) {
    if (
      !params ||
      (id && !params.id) ||
      (!id && !params.nome) ||
      (!id && !params.dm_tipo) ||
      (!id && !params.duracao)
    ) {
      throw new Error(Erros.erroParametrosInsuficientes);
    }
    let procedimento = {
      id: params.id,
      nome: params.nome,
      dm_tipo: params.dm_tipo,
      duracao: params.duracao,
    };
    return procedimento;
  },

  /* */
  validarAuxiliar(params, id = false) {
    if (!params || (!id && !params.nr_cro) || (id && !params.id)) {
      throw new Error(Erros.erroParametrosInsuficientes);
    }
    let pessoa =
      !id || params.pessoa ? this.validarPessoa(params.pessoa, "auxiliar", id) : undefined;
    let auxiliar = {
      id: params.id,
      nr_cro: params.nr_cro,
      dm_formacao: params.dm_formacao,
      Pessoa: pessoa,
    };
    return auxiliar;
  },
};
