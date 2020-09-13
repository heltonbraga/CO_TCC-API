const BancoController = require("../controllers/BancoController.js");
const DentCtrl = require("../controllers/DentistaController.js");
const AuxCtrl = require("../controllers/AuxiliarController.js");
const ProcCtrl = require("../controllers/ProcedimentoController.js");
const PessoaController = require("../controllers/PessoaController.js");
const PacienteCtrl = require("../controllers/PacienteController.js");
const AtdCtrl = require("../controllers/AtendimentoController.js");
const PronCtrl = require("../controllers/ProntuarioController.js");
const AnamCtrl = require("../controllers/AnamneseController.js");
const GenCtrl = require("../controllers/GenericController.js");
const Erros = require("../controllers/Erros.js");

module.exports = (app) => {
  const findAllValidator = (params, ordenacoes) => {
    params.page = !params.page ? 1 : parseInt(params.page);
    params.pagesize = !params.pagesize ? 10 : parseInt(params.pagesize);
    params.order = !params.order ? ordenacoes[0] : params.order;
    if (isNaN(params.page) || isNaN(params.pagesize) || ordenacoes.indexOf(params.order) < 0) {
      throw new Error(Erros.erroRequestFindAll + ordenacoes);
    }
    return params;
  };

  const tccRoute = async (request, response, controller, requestValidator = null, ordenacoes) => {
    try {
      let params = { ...request.params, ...request.body, ...request.query };
      console.log(params);
      if (requestValidator) {
        params = requestValidator(params, ordenacoes);
      }
      const data = await controller(params);
      if (data === null) {
        throw new Error(Erros.chaveInvalida);
      }
      response.send(data);
    } catch (err) {
      console.log(err);
      response.status(400).send({ message: err.message });
    }
  };

  app.get("/usuarios/", (req, res) => tccRoute(req, res, PessoaController.getPerfil));
  app.get("/usuarios/verificar/", (req, res) => tccRoute(req, res, PessoaController.verificar));

  app.get("/atendimentos", (req, res) => tccRoute(req, res, AtdCtrl.findByFilter));
  app.get("/atendimentos/mes", (req, res) => tccRoute(req, res, AtdCtrl.findByMes));
  app.get("/atendimentos/:id", (req, res) => tccRoute(req, res, AtdCtrl.findById));
  app.get("/atendimentos/log/:id", (req, res) => tccRoute(req, res, AtdCtrl.findLog));
  app.get("/atendimentos/paciente/:id", (req, res) => tccRoute(req, res, AtdCtrl.findUltimoEProximo));
  app.post("/atendimentos", (req, res) => tccRoute(req, res, AtdCtrl.store));
  app.patch("/atendimentos/cancelar", (req, res) => tccRoute(req, res, AtdCtrl.cancelar));
  app.patch("/atendimentos/confirmar", (req, res) => tccRoute(req, res, AtdCtrl.confirmar));
  app.patch("/atendimentos/remarcar", (req, res) => tccRoute(req, res, AtdCtrl.remarcar));
  app.patch("/atendimentos/realizar", (req, res) => tccRoute(req, res, AtdCtrl.realizar));

  app.get("/prontuarios/paciente/:id", (req, res) => tccRoute(req, res, PronCtrl.findByPaciente));
  app.get("/prontuarios/:id", (req, res) => tccRoute(req, res, PronCtrl.findById));
  app.post("/prontuarios", (req, res) => tccRoute(req, res, PronCtrl.store));
  app.patch("/prontuarios", (req, res) => tccRoute(req, res, PronCtrl.update));

  app.post("/anamneses", (req, res) => tccRoute(req, res, AnamCtrl.store));
  app.patch("/anamneses", (req, res) => tccRoute(req, res, AnamCtrl.update));

  app.get("/vagas", (req, res) => tccRoute(req, res, AtdCtrl.findVaga));
  app.get("/vagas/calendario", (req, res) => tccRoute(req, res, AtdCtrl.findVagaCalendario));

  app.get("/bancos", (req, res) => tccRoute(req, res, BancoController.findAll));
  app.get("/bancos/:id", (req, res) => tccRoute(req, res, BancoController.findById));

  app.get("/proc", (req, res) =>
    tccRoute(req, res, ProcCtrl.findAll, findAllValidator, ProcCtrl.getOrder())
  );
  app.get("/proc/livres", (req, res) =>
    tccRoute(req, res, ProcCtrl.findAllLivres, findAllValidator, ProcCtrl.getOrder())
  );

  app.get("/procedimentos", (req, res) =>
    tccRoute(req, res, ProcCtrl.findAll, findAllValidator, ProcCtrl.getOrder())
  );
  app.get("/procedimentos/nome", (req, res) => tccRoute(req, res, ProcCtrl.findByNome));
  app.get("/procedimentos/:id", (req, res) => tccRoute(req, res, ProcCtrl.findById));
  app.post("/procedimentos", (req, res) => tccRoute(req, res, ProcCtrl.store));
  app.patch("/procedimentos", (req, res) => tccRoute(req, res, ProcCtrl.update));
  app.delete("/procedimentos", (req, res) => tccRoute(req, res, ProcCtrl.delete));

  app.get("/dentistas", (req, res) =>
    tccRoute(req, res, DentCtrl.findAll, findAllValidator, DentCtrl.getOrder())
  );
  app.get("/dentistas/nome", (req, res) => tccRoute(req, res, DentCtrl.findByNome));
  app.get("/dentistas/procedimento", (req, res) => tccRoute(req, res, DentCtrl.findByProcedimento));
  app.get("/dentistas/disponibilidade", (req, res) => tccRoute(req, res, DentCtrl.findByDisp));
  app.get("/dentistas/:id", (req, res) => tccRoute(req, res, DentCtrl.findById));
  app.post("/dentistas", (req, res) => tccRoute(req, res, DentCtrl.store));
  app.patch("/dentistas", (req, res) => tccRoute(req, res, DentCtrl.update));
  app.delete("/dentistas", (req, res) => tccRoute(req, res, DentCtrl.delete));

  app.get("/auxiliares", (req, res) =>
    tccRoute(req, res, AuxCtrl.findAll, findAllValidator, AuxCtrl.getOrder())
  );
  app.get("/auxiliares/nome", (req, res) => tccRoute(req, res, AuxCtrl.findByNome));
  app.get("/auxiliares/:id", (req, res) => tccRoute(req, res, AuxCtrl.findById));
  app.post("/auxiliares", (req, res) => tccRoute(req, res, AuxCtrl.store));
  app.patch("/auxiliares", (req, res) => tccRoute(req, res, AuxCtrl.update));
  app.delete("/auxiliares", (req, res) => tccRoute(req, res, AuxCtrl.delete));

  app.get("/pacientes", (req, res) =>
    tccRoute(req, res, PacienteCtrl.findAll, findAllValidator, PacienteCtrl.getOrder())
  );
  app.get("/pacientes/nome", (req, res) => tccRoute(req, res, PacienteCtrl.findByNome));
  app.get("/pacientes/:id", (req, res) => tccRoute(req, res, PacienteCtrl.findById));
  app.post("/pacientes", (req, res) => tccRoute(req, res, PacienteCtrl.store));
  app.patch("/pacientes", (req, res) => tccRoute(req, res, PacienteCtrl.update));

  app.get("/relatorios", (req, res) => tccRoute(req, res, GenCtrl.relatorio));
};
