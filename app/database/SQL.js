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

exports.findVagaExt =
  "SELECT macro.dentista_id, macro.nr_cro, macro.nome, macro.procedimento_id, " +
  "       MIN(macro.horario) AS primeira, MAX(macro.horario) as ultima " +
  "  FROM ( " +
  "SELECT d.id, d.hr_inicio, d.hr_fim, pd.procedimento_id, p.nome, de.nr_cro, d.dentista_id, h.horario,  " +
  "       TIME(h.horario) AS inicio, TIME(DATE_ADD(h.horario, INTERVAL pr.duracao MINUTE)) AS fim " +
  "  FROM disponibilidade d " +
  " INNER JOIN procedimentos_dentistas pd " +
  "    ON d.dentista_id = pd.dentista_id " +
  "   AND pd.procedimento_id = :proc  " +
  "   AND d.dm_dia_semana = :diasemana " +
  " INNER JOIN dentista de " +
  "    ON de.id = d.dentista_id " +
  "   AND (de.dt_liberacao IS NULL OR de.dt_liberacao <= :dia) " +
  "   AND (de.dt_bloqueio IS NULL OR de.dt_bloqueio > :dia) " +
  " INNER JOIN pessoa p " +
  "    ON p.id = de.id " +
  "   AND p.dt_exclusao IS NULL  " +
  "   AND (:dent = 0 OR p.id = :dent) " +
  " INNER JOIN procedimento pr " +
  "    ON pr.id = pd.procedimento_id " +
  " INNER JOIN ( " +
  "SELECT DATE_ADD(:dia, INTERVAL n.number*15 MINUTE) AS horario " +
  "  FROM ( " +
  "SELECT (p0.n + p1.n*2 + p2.n * POWER(2,2) + p3.n * POWER(2,3) " +
  "       + p4.n * POWER(2,4) + p5.n * POWER(2,5) + p6.n * POWER(2,6)) as number " +
  "  FROM (SELECT 0 as n UNION SELECT 1) p0, " +
  "       (SELECT 0 as n UNION SELECT 1) p1, " +
  "       (SELECT 0 as n UNION SELECT 1) p2, " +
  "       (SELECT 0 as n UNION SELECT 1) p3, " +
  "       (SELECT 0 as n UNION SELECT 1) p4, " +
  "       (SELECT 0 as n UNION SELECT 1) p5, " +
  "       (SELECT 0 as n UNION SELECT 1) p6 " +
  "       ) n " +
  " WHERE n.number < 96 " +
  "       ) h " +
  "    ON TIME(h.horario) >= d.hr_inicio " +
  "   AND TIME(DATE_ADD(h.horario, INTERVAL pr.duracao MINUTE)) between d.hr_inicio and d.hr_fim " +
  "   AND h.horario > DATE_ADD(NOW(), INTERVAL -3 HOUR) " +
  "       ) macro " +
  " WHERE NOT EXISTS ( " +
  "SELECT 1 " +
  "  FROM atendimento a   " +
  " INNER JOIN procedimento pa  " +
  "    ON pa.id = a.procedimento_id  " +
  " WHERE a.dentista_id = macro.dentista_id  " +
  "   AND DATE(a.dt_horario) = :dia " +
  "   AND a.dm_situacao <> 'cancelado'  " +
  "   AND TIME(DATE_ADD(a.dt_horario, INTERVAL -3 HOUR)) < macro.fim " +
  "   AND TIME(DATE_ADD(a.dt_horario, INTERVAL pa.duracao-180 MINUTE)) > macro.inicio) " +
  " GROUP BY macro.dentista_id, macro.nr_cro, macro.nome, macro.procedimento_id";

exports.findVagaCalendario =
  "SELECT macro.dia, DATE_FORMAT(macro.inicio, '%Y-%m-%d %H:%i') AS inicio, GROUP_CONCAT(DISTINCT macro.dentista_id) AS dentistas " +
  "  FROM ( " +
  "SELECT d.id, d.hr_inicio, d.hr_fim, pd.procedimento_id, p.nome, de.nr_cro, d.dentista_id, " +
  "       TIME(DATE_ADD(dias.dia, INTERVAL (h.number*15) + pr.duracao MINUTE)) AS fim, " +
  "	   DATE_ADD(dias.dia, INTERVAL h.number*15 MINUTE) AS inicio, dias.dia " +
  "  FROM disponibilidade d " +
  " INNER JOIN procedimentos_dentistas pd " +
  "    ON d.dentista_id = pd.dentista_id " +
  "   AND pd.procedimento_id = :proc " +
  " INNER JOIN ( " +
  "SELECT DATE_ADD(CURDATE(), INTERVAL n.number DAY) AS dia,  " +
  "	   ELT(FIELD(DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL n.number DAY)), 1, 2, 3, 4, 5, 6, 7),  " +
  "	   'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sabado') AS dm_dia_semana " +
  "  FROM ( " +
  "SELECT (p0.n + p1.n*2 + p2.n * POWER(2,2) + p3.n * POWER(2,3) " +
  "	   + p4.n * POWER(2,4))+1 as number " +
  "  FROM (SELECT 0 as n UNION SELECT 1) p0, " +
  "       (SELECT 0 as n UNION SELECT 1) p1, " +
  "       (SELECT 0 as n UNION SELECT 1) p2, " +
  "       (SELECT 0 as n UNION SELECT 1) p3, " +
  "       (SELECT 0 as n UNION SELECT 1) p4 " +
  "       ) n " +
  " WHERE n.number < 31 " +
  "       ) dias " +
  "    ON d.dm_dia_semana = dias.dm_dia_semana " +
  " INNER JOIN dentista de " +
  "    ON de.id = d.dentista_id " +
  "   AND (de.dt_liberacao IS NULL OR de.dt_liberacao <= dias.dia) " +
  "   AND (de.dt_bloqueio IS NULL OR de.dt_bloqueio > dias.dia) " +
  " INNER JOIN pessoa p " +
  "    ON p.id = de.id " +
  "   AND p.dt_exclusao IS NULL  " +
  "   AND (:dent = 0 OR p.id = :dent) " +
  " INNER JOIN procedimento pr " +
  "    ON pr.id = pd.procedimento_id " +
  " INNER JOIN ( " +
  "SELECT (p0.n + p1.n*2 + p2.n * POWER(2,2) + p3.n * POWER(2,3) " +
  "	   + p4.n * POWER(2,4) + p5.n * POWER(2,5) + p6.n * POWER(2,6)) as number " +
  "  FROM (SELECT 0 as n UNION SELECT 1) p0, " +
  "       (SELECT 0 as n UNION SELECT 1) p1, " +
  "       (SELECT 0 as n UNION SELECT 1) p2, " +
  "       (SELECT 0 as n UNION SELECT 1) p3, " +
  "       (SELECT 0 as n UNION SELECT 1) p4, " +
  "       (SELECT 0 as n UNION SELECT 1) p5, " +
  "       (SELECT 0 as n UNION SELECT 1) p6 " +
  "       ) h " +
  "    ON TIME(DATE_ADD(dias.dia, INTERVAL h.number*15 MINUTE)) >= d.hr_inicio " +
  "   AND TIME(DATE_ADD(dias.dia, INTERVAL (h.number*15) + pr.duracao MINUTE)) between d.hr_inicio and d.hr_fim " +
  "       ) macro " +
  "  LEFT JOIN atendimento a " +
  "    ON a.dentista_id = macro.dentista_id " +
  "   AND DATE(a.dt_horario) = macro.dia " +
  "  LEFT JOIN procedimento pa " +
  "    ON pa.id = a.procedimento_id " +
  " WHERE a.id IS NULL  " +
  "    OR (a.dm_situacao = 'cancelado' " +
  "    OR TIME(DATE_ADD(a.dt_horario, INTERVAL -3 HOUR)) >= TIME(macro.fim) " +
  "	   OR TIME(DATE_ADD(a.dt_horario, INTERVAL pa.duracao-180 MINUTE)) <= macro.inicio) " +
  " GROUP BY macro.dia, macro.inicio";

exports.findVaga =
  "SELECT macro.dentista_id, macro.nr_cro, macro.nome, macro.procedimento_id, macro.horario " +
  "  FROM ( " +
  "SELECT d.id, d.hr_inicio, d.hr_fim, pd.procedimento_id, p.nome, de.nr_cro, d.dentista_id, h.horario,  " +
  "       TIME(h.horario) AS inicio, TIME(DATE_ADD(h.horario, INTERVAL pr.duracao MINUTE)) AS fim " +
  "  FROM disponibilidade d " +
  " INNER JOIN procedimentos_dentistas pd " +
  "    ON d.dentista_id = pd.dentista_id " +
  "   AND pd.procedimento_id = :proc  " +
  "   AND d.dm_dia_semana = :diasemana " +
  " INNER JOIN dentista de " +
  "    ON de.id = d.dentista_id " +
  "   AND (de.dt_liberacao IS NULL OR de.dt_liberacao <= :dia) " +
  "   AND (de.dt_bloqueio IS NULL OR de.dt_bloqueio > :dia) " +
  " INNER JOIN pessoa p " +
  "    ON p.id = de.id " +
  "   AND p.dt_exclusao IS NULL  " +
  "   AND (:dent = 0 OR p.id = :dent) " +
  " INNER JOIN procedimento pr " +
  "    ON pr.id = pd.procedimento_id " +
  " INNER JOIN ( " +
  "SELECT DATE_ADD(:dia, INTERVAL n.number*15 MINUTE) AS horario " +
  "  FROM ( " +
  "SELECT (p0.n + p1.n*2 + p2.n * POWER(2,2) + p3.n * POWER(2,3) " +
  "       + p4.n * POWER(2,4) + p5.n * POWER(2,5) + p6.n * POWER(2,6)) as number " +
  "  FROM (SELECT 0 as n UNION SELECT 1) p0, " +
  "       (SELECT 0 as n UNION SELECT 1) p1, " +
  "       (SELECT 0 as n UNION SELECT 1) p2, " +
  "       (SELECT 0 as n UNION SELECT 1) p3, " +
  "       (SELECT 0 as n UNION SELECT 1) p4, " +
  "       (SELECT 0 as n UNION SELECT 1) p5, " +
  "       (SELECT 0 as n UNION SELECT 1) p6 " +
  "       ) n " +
  " WHERE n.number < 96 " +
  "       ) h " +
  "    ON TIME(h.horario) >= d.hr_inicio " +
  "   AND TIME(DATE_ADD(h.horario, INTERVAL pr.duracao MINUTE)) between d.hr_inicio and d.hr_fim " +
  "   AND h.horario > DATE_ADD(NOW(), INTERVAL -3 HOUR) " +
  "       ) macro " +
  "  LEFT JOIN atendimento a " +
  "    ON a.dentista_id = macro.dentista_id " +
  "   AND DATE(a.dt_horario) = :dia " +
  "  LEFT JOIN procedimento pa " +
  "    ON pa.id = a.procedimento_id " +
  " WHERE a.id IS NULL  " +
  "    OR (a.dm_situacao = 'cancelado' " +
  "    OR TIME(DATE_ADD(a.dt_horario, INTERVAL -3 HOUR)) >= macro.fim  " +
  "    OR TIME(DATE_ADD(a.dt_horario, INTERVAL pa.duracao-180 MINUTE)) <= macro.inicio) " +
  " ORDER BY macro.horario";

exports.checkAtendimento =
  "  SELECT d.id " +
  "    FROM disponibilidade d  " +
  "   INNER JOIN procedimentos_dentistas pd  " +
  "      ON d.dentista_id = pd.dentista_id  " +
  "     AND pd.procedimento_id = :proc " +
  "     AND d.dm_dia_semana = :diasemana " +
  "   INNER JOIN dentista de  " +
  "      ON de.id = d.dentista_id  " +
  "     AND (de.dt_liberacao IS NULL OR de.dt_liberacao <= :dia)  " +
  "     AND (de.dt_bloqueio IS NULL OR de.dt_bloqueio > :dia)  " +
  "   INNER JOIN pessoa p  " +
  "      ON p.id = de.id  " +
  "     AND p.dt_exclusao IS NULL   " +
  "     AND p.id = :dent " +
  "   INNER JOIN procedimento pr  " +
  "      ON pr.id = pd.procedimento_id  " +
  "     AND TIME(:dia) >= d.hr_inicio  " +
  "     AND TIME(DATE_ADD(:dia, INTERVAL pr.duracao MINUTE)) between d.hr_inicio and d.hr_fim  " +
  "     AND :dia > DATE_ADD(NOW(), INTERVAL -3 HOUR)  " +
  "    LEFT JOIN atendimento a  " +
  "      ON a.dentista_id = pd.dentista_id  " +
  "     AND DATE(a.dt_horario) = DATE(:dia)  " +
  "     AND a.id <> :id  " +
  "    LEFT JOIN procedimento pa  " +
  "      ON pa.id = a.procedimento_id  " +
  "   WHERE (a.id IS NULL   " +
  "      OR a.dm_situacao = 'cancelado'  " +
  "      OR TIME(DATE_ADD(a.dt_horario, INTERVAL -3 HOUR)) >= TIME(DATE_ADD(:dia, INTERVAL pr.duracao MINUTE)) " +
  "      OR TIME(DATE_ADD(a.dt_horario, INTERVAL pa.duracao-180 MINUTE)) <= TIME(:dia))  " +
  "      OR EXISTS ( " +
  "  SELECT 1  " +
  "    FROM atendimento b  " +
  "   INNER JOIN procedimento pb  " +
  "      ON pb.id = b.procedimento_id  " +
  "   WHERE b.paciente_id = :pac  " +
  "     AND b.id <> :id  " +
  "     AND b.dm_situacao <> 'cancelado' " +
  "	    AND DATE_ADD(b.dt_horario, INTERVAL -3 HOUR) < DATE_ADD(:dia, INTERVAL pr.duracao MINUTE)  " +
  "	    AND DATE_ADD(b.dt_horario, INTERVAL pb.duracao-180 MINUTE) > :dia " +
  "	        )";

exports.atendimentoAnterior =
  "SELECT id " +
  "  FROM atendimento a " +
  " WHERE a.paciente_id = :pac " +
  "   AND a.dt_horario < :hora" +
  " ORDER BY dt_horario DESC " +
  " LIMIT 1";

exports.relatHorasPorDentista =
  "SELECT d.nr_cro, p.nome, SUM(time_to_sec(timediff(di.hr_fim, di.hr_inicio)))/60/60 AS horas_disponiveis, " +
  "	   IFNULL( " +
  "	   (SELECT SUM(pa.duracao)/60 " +
  "		  FROM atendimento a " +
  "		 INNER JOIN procedimento pa " +
  "		    ON a.procedimento_id = pa.id " +
  "		 WHERE a.dentista_id = d.id " +
  "		   AND a.dm_situacao = 'realizado' " +
  "		   AND a.dt_horario BETWEEN :inicio AND :fim), 0) AS horas_utilizadas " +
  "  FROM pessoa p " +
  " INNER JOIN dentista d " +
  "    ON p.dt_exclusao IS NULL " +
  "   AND p.id = d.id " +
  " INNER JOIN disponibilidade di " +
  "    ON d.id = di.dentista_id " +
  " INNER JOIN ( " +
  "SELECT DATE_ADD(:inicio, INTERVAL n.number DAY) AS dia,  " +
  "	   ELT(FIELD(DAYOFWEEK(DATE_ADD(:inicio, INTERVAL n.number DAY)), 1, 2, 3, 4, 5, 6, 7),  " +
  "	   'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sabado') AS dm_dia_semana " +
  "  FROM ( " +
  "SELECT (p0.n + p1.n*2 + p2.n * POWER(2,2) + p3.n * POWER(2,3) + p4.n * POWER(2,4) + p5.n * POWER(2,5)  " +
  "	   + p6.n * POWER(2,6) + p7.n * POWER(2,7) + p8.n * POWER(2,8)) as number " +
  "  FROM (SELECT 0 as n UNION SELECT 1) p0, " +
  "       (SELECT 0 as n UNION SELECT 1) p1, " +
  "       (SELECT 0 as n UNION SELECT 1) p2, " +
  "       (SELECT 0 as n UNION SELECT 1) p3, " +
  "       (SELECT 0 as n UNION SELECT 1) p4, " +
  "       (SELECT 0 as n UNION SELECT 1) p5, " +
  "       (SELECT 0 as n UNION SELECT 1) p6, " +
  "       (SELECT 0 as n UNION SELECT 1) p7, " +
  "       (SELECT 0 as n UNION SELECT 1) p8 " +
  "       ) n " +
  " WHERE n.number < 367) per " +
  "    ON per.dia BETWEEN :inicio AND :fim " +
  "   AND di.dm_dia_semana = per.dm_dia_semana " +
  "   AND per.dia BETWEEN d.dt_liberacao AND IFNULL(d.dt_bloqueio, '2999-01-01') " +
  " GROUP BY d.nr_cro, p.nome";

exports.relatAtdPorConvenio =
  "SELECT a.dm_convenio, COUNT(1) AS qtd " +
  "  FROM atendimento a " +
  " WHERE a.dt_horario BETWEEN :inicio AND :fim " +
  "   AND a.dm_situacao = 'realizado' " +
  " GROUP BY a.dm_convenio ";

exports.relatAtdPorProcedimento =
  "SELECT p.nome, COUNT(1) AS qtd " +
  "  FROM atendimento a " +
  " INNER JOIN procedimento p " +
  "    ON a.procedimento_id = p.id " +
  "   AND a.dt_horario BETWEEN :inicio AND :fim " +
  "   AND a.dm_situacao = 'realizado' " +
  " GROUP BY p.nome ";

exports.relatCancelamentoPorMotivo =
  "SELECT complemento, COUNT(1) AS qtd  " +
  "  FROM log_atendimento " +
  " WHERE dt_acao BETWEEN :inicio AND :fim " +
  "   AND acao = 'cancelamento' " +
  " GROUP BY complemento ";

exports.relatReagendamentoPorPerfil =
  "SELECT p.perfil, COUNT(1) AS qtd " +
  "  FROM log_atendimento la " +
  " INNER JOIN pessoa p " +
  "    ON la.pessoa_id = p.id " +
  "   AND dt_acao BETWEEN :inicio AND :fim " +
  "   AND acao = 'reagendamento' " +
  " GROUP BY p.perfil ";

exports.relatAtendimentoPorDia =
  "SELECT DATE(dt_horario) AS dia, COUNT(1) AS qtd " +
  "  FROM atendimento a " +
  " WHERE dt_horario BETWEEN :inicio AND :fim " +
  " GROUP BY DATE(dt_horario)";
