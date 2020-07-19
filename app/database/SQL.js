exports.countAtendimentosSemDisponibilidade =
  "SELECT COUNT(1) as total " +
  "FROM atendimento a " +
  "WHERE a.dentista_id = :id " +
  "AND a.dm_situacao IN ('agendado', 'confirmado') " +
  "AND NOT EXISTS ( " +
  "	SELECT 1 " +
  "	FROM disponibilidade b " +
  "	INNER JOIN ( " +
  "		SELECT 'domingo' AS nome, 1 AS num UNION ALL " +
  "		SELECT 'segunda' AS nome, 2 AS num UNION ALL " +
  "		SELECT 'terça' AS nome, 3 AS num UNION ALL " +
  "		SELECT 'quarta' AS nome, 4 AS num UNION ALL " +
  "		SELECT 'quinta' AS nome, 5 AS num UNION ALL " +
  "		SELECT 'sexta' AS nome, 6 AS num UNION ALL " +
  "		SELECT 'sabado' AS nome, 7 AS num) c " +
  "		ON b.dm_dia_semana = c.nome " +
  "	WHERE a.dentista_id = b.dentista_id " +
  "	AND DAYOFWEEK(a.dt_horario) = c.num " +
  "	AND TIME(a.dt_horario) BETWEEN b.hr_inicio AND b.hr_fim) ";
