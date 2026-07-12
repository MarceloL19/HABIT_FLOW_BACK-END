import { pool } from "../config/db.js";

const etiquetasSemana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const mapearSemana = (rows) => {
  const porDia = new Map(rows.map((row) => [row.dia, Number(row.total) || 0]));

  return etiquetasSemana.map((dia) => ({
    dia,
    total: porDia.get(dia) || 0
  }));
};

const mapearMeses = (rows) => {
  const meses = new Map();

  rows.forEach((row) => {
    if (!meses.has(row.mes)) {
      meses.set(row.mes, {
        nombre: row.mes,
        datos: [
          { semana: "S1", progreso: 0 },
          { semana: "S2", progreso: 0 },
          { semana: "S3", progreso: 0 },
          { semana: "S4", progreso: 0 }
        ]
      });
    }

    const indice = Number(row.semana) - 1;

    if (indice >= 0 && indice < 4) {
      meses.get(row.mes).datos[indice] = {
        semana: `S${row.semana}`,
        progreso: Number(row.progreso) || 0
      };
    }
  });

  return Array.from(meses.values());
};

export const generarEstadisticasUsuario = async (idUsuario) => {
  const resumenQuery = `
    SELECT
      COUNT(DISTINCT h.id_habito) AS total_habitos,
      COUNT(c.id_cumplimiento) FILTER (WHERE c.completado = true) AS total_completados,
      COUNT(c.id_cumplimiento) FILTER (
        WHERE c.completado = true
          AND c.fecha = CURRENT_DATE
      ) AS completados_hoy
    FROM habitos h
    LEFT JOIN cumplimientos c ON c.id_habito = h.id_habito
    WHERE h.id_usuario = $1
      AND h.activo = true;
  `;

  const semanaQuery = `
    WITH dias AS (
      SELECT generate_series(
        date_trunc('week', CURRENT_DATE)::date,
        (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date,
        INTERVAL '1 day'
      )::date AS fecha
    )
    SELECT
      CASE EXTRACT(ISODOW FROM dias.fecha)
        WHEN 1 THEN 'Lun'
        WHEN 2 THEN 'Mar'
        WHEN 3 THEN 'Mie'
        WHEN 4 THEN 'Jue'
        WHEN 5 THEN 'Vie'
        WHEN 6 THEN 'Sab'
        ELSE 'Dom'
      END AS dia,
      COUNT(c.id_cumplimiento) FILTER (WHERE c.completado = true) AS total
    FROM dias
    LEFT JOIN habitos h
      ON h.id_usuario = $1
      AND h.activo = true
    LEFT JOIN cumplimientos c
      ON c.id_habito = h.id_habito
      AND c.fecha = dias.fecha
    GROUP BY dias.fecha
    ORDER BY dias.fecha;
  `;

  const mesesQuery = `
    WITH meses AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '2 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      )::date AS inicio_mes
    ),
    semanas AS (
      SELECT
        inicio_mes,
        generate_series(1, 4) AS semana
      FROM meses
    )
    SELECT
      INITCAP(TO_CHAR(semanas.inicio_mes, 'TMMonth')) AS mes,
      semanas.semana,
      CASE
        WHEN COUNT(DISTINCT h.id_habito) = 0 THEN 0
        ELSE ROUND(
          (
            COUNT(c.id_cumplimiento) FILTER (WHERE c.completado = true)::numeric /
            NULLIF(COUNT(DISTINCT h.id_habito) * 7, 0)
          ) * 100
        )
      END AS progreso
    FROM semanas
    LEFT JOIN habitos h
      ON h.id_usuario = $1
      AND h.activo = true
      AND h.fecha_creacion::date <= (semanas.inicio_mes + ((semanas.semana * 7 - 1) || ' days')::interval)::date
    LEFT JOIN cumplimientos c
      ON c.id_habito = h.id_habito
      AND c.fecha BETWEEN
        (semanas.inicio_mes + (((semanas.semana - 1) * 7) || ' days')::interval)::date
        AND
        (semanas.inicio_mes + ((semanas.semana * 7 - 1) || ' days')::interval)::date
    GROUP BY semanas.inicio_mes, semanas.semana
    ORDER BY semanas.inicio_mes, semanas.semana;
  `;

  const topHabitosQuery = `
    SELECT
      h.id_habito AS id,
      h.nombre,
      h.categoria,
      h.activo,
      EXISTS (
        SELECT 1
        FROM cumplimientos ch
        WHERE ch.id_habito = h.id_habito
          AND ch.fecha = CURRENT_DATE
          AND ch.completado = true
      ) AS "completadoHoy",
      COUNT(c.id_cumplimiento) FILTER (WHERE c.completado = true) AS "diasCompletados",
      COUNT(c.id_cumplimiento) FILTER (
        WHERE c.completado = true
          AND c.fecha >= CURRENT_DATE - INTERVAL '6 days'
      ) AS racha
    FROM habitos h
    LEFT JOIN cumplimientos c ON c.id_habito = h.id_habito
    WHERE h.id_usuario = $1
      AND h.activo = true
    GROUP BY h.id_habito, h.nombre, h.categoria, h.activo
    ORDER BY "diasCompletados" DESC, racha DESC, h.nombre ASC
    LIMIT 5;
  `;

  const [resumenResult, semanaResult, mesesResult, topHabitosResult] = await Promise.all([
    pool.query(resumenQuery, [idUsuario]),
    pool.query(semanaQuery, [idUsuario]),
    pool.query(mesesQuery, [idUsuario]),
    pool.query(topHabitosQuery, [idUsuario])
  ]);

  const resumenBase = resumenResult.rows[0] || {};
  const totalHabitos = Number(resumenBase.total_habitos) || 0;
  const completadosHoy = Number(resumenBase.completados_hoy) || 0;
  const totalCompletados = Number(resumenBase.total_completados) || 0;
  const topHabitos = topHabitosResult.rows.map((habito) => ({
    ...habito,
    estado: habito.activo ? "activo" : "inactivo",
    racha: Number(habito.racha) || 0,
    diasCompletados: Number(habito.diasCompletados) || 0
  }));
  const rachaActual = topHabitos.length > 0
    ? Math.max(...topHabitos.map((habito) => habito.racha))
    : 0;
  const progresoGeneral = totalHabitos > 0
    ? Math.round((completadosHoy / totalHabitos) * 100)
    : 0;

  return {
    resumen: {
      totalHabitos,
      completadosHoy,
      totalCompletados,
      rachaActual,
      progresoGeneral
    },
    semana: mapearSemana(semanaResult.rows),
    mesesProgreso: mapearMeses(mesesResult.rows),
    topHabitos,
    mejorHabito: topHabitos[0] || null,
    mensajeMotivacional: progresoGeneral >= 70
      ? "Excelente avance, vas construyendo una gran constancia."
      : progresoGeneral >= 40
        ? "Buen progreso, sigue completando tus habitos esta semana."
        : "Cada dia cuenta, elige un habito pequeno y empieza de nuevo."
  };
};
