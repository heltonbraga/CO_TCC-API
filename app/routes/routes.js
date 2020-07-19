const BancoController = require("../controllers/BancoController.js");
const DentCtrl = require("../controllers/DentistaController.js");
const AuxCtrl = require("../controllers/AuxiliarController.js");
const ProcCtrl = require("../controllers/ProcedimentoController.js");
const Erros = require("../controllers/Erros.js");

module.exports = (app) => {
  const findAllValidator = (params, ordenacoes) => {
    try {
      params.page = !params.page ? 1 : parseInt(params.page);
      params.pagesize = !params.pagesize ? 10 : parseInt(params.pagesize);
      params.order = !params.order ? ordenacoes[0] : params.order;
      if (isNaN(params.page) || isNaN(params.pagesize) || ordenacoes.indexOf(params.order) < 0) {
        throw new Error(Erros.erroRequestFindAll);
      }
      return params;
    } catch (erro) {
      throw new Error(Erros.erroRequestFindAll);
    }
  };

  const tccRoute = async (request, response, controller, requestValidator = null, ordenacoes) => {
    try {
      let params = { ...request.params, ...request.body };
      if (requestValidator) {
        params = requestValidator(params, ordenacoes);
      }
      console.log(params);
      const data = await controller(params);
      if (data === null) {
        response.status(400).send({
          message: Erros.chaveInvalida,
        });
      } else {
        response.send(data);
      }
    } catch (err) {
      console.log(err);
      response.status(400).send({
        message: err.message,
      });
    }
  };

  app.get("/bancos", (req, res) => tccRoute(req, res, BancoController.findAll));
  app.get("/bancos/:id", (req, res) => tccRoute(req, res, BancoController.findById));

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
};
