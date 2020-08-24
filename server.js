const express = require("express");
var cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

const PessoaController = require("./app/controllers/PessoaController.js");

const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { response } = require("express");
require("dotenv/config");
require("./app/database");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const router = express.Router();

router.get("/", (req, res) =>
  res.json({
    message: "TODO",
  })
);

app.use("/", router);
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH_URI,
  }),
  audience: process.env.AUTH_AUDIENCE,
  issuer: process.env.AUTH_ISSUER,
  algorithms: ["RS256"],
}).unless({ path: ["/usuarios/", "/bancos", "/proc"] });

app.use(checkJwt);
require("./app/routes/routes.js")(app);

app.listen(process.env.PORT || 3001);
console.log("CO_TCC-API is up !");
