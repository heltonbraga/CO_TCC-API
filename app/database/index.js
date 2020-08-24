const Sequelize = require("sequelize");
const dbConfig = require("./database");

const Pessoa = require("../models/Pessoa");
const Dentista = require("../models/Dentista");
const Auxiliar = require("../models/Auxiliar");
const Paciente = require("../models/Paciente");
const Anamnese = require("../models/Anamnese");
const Atendimento = require("../models/Atendimento");
const LogAtendimento = require("../models/LogAtendimento");
const Disponibilidade = require("../models/Disponibilidade");
const Exame = require("../models/Exame");
const Parametro = require("../models/Parametro");
const Procedimento = require("../models/Procedimento");
const Prontuario = require("../models/Prontuario");
const Banco = require("../models/Banco");
const BancoPessoa = require("../models/BancoPessoa");

const connection = new Sequelize(dbConfig);

Pessoa.init(connection);
Dentista.init(connection);
Auxiliar.init(connection);
Paciente.init(connection);
Anamnese.init(connection);
Atendimento.init(connection);
LogAtendimento.init(connection);
Disponibilidade.init(connection);
Exame.init(connection);
Parametro.init(connection);
Procedimento.init(connection);
Prontuario.init(connection);
Banco.init(connection);
BancoPessoa.init(connection);

Pessoa.associate(connection.models);
Dentista.associate(connection.models);
Auxiliar.associate(connection.models);
Paciente.associate(connection.models);
Anamnese.associate(connection.models);
Atendimento.associate(connection.models);
LogAtendimento.associate(connection.models);
Disponibilidade.associate(connection.models);
Exame.associate(connection.models);
Parametro.associate(connection.models);
Procedimento.associate(connection.models);
Prontuario.associate(connection.models);
Banco.associate(connection.models);
BancoPessoa.associate(connection.models);

module.exports = connection;
