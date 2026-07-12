INSERT INTO usuarios (id_usuario, nombre, correo, password, fecha_registro) VALUES
  (1, 'Marcelo Loayza', 'marcelo@gmail.com', '123456', '2026-05-21'),
  (2, 'Mariana Torres', 'mariana@gmail.com', '123456', '2026-05-20'),
  (3, 'Carlos Rivas', 'carlos@gmail.com', '123456', '2026-05-19')
ON CONFLICT (id_usuario) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  correo = EXCLUDED.correo,
  password = EXCLUDED.password,
  fecha_registro = EXCLUDED.fecha_registro;

INSERT INTO preferencias (id_usuario, tema, idioma, notificaciones) VALUES
  (1, 'claro', 'espanol', true),
  (2, 'oscuro', 'espanol', true),
  (3, 'claro', 'ingles', false)
ON CONFLICT (id_usuario) DO UPDATE SET
  tema = EXCLUDED.tema,
  idioma = EXCLUDED.idioma,
  notificaciones = EXCLUDED.notificaciones;

INSERT INTO habitos (id_habito, id_usuario, nombre, descripcion, categoria, frecuencia, activo, fecha_creacion) VALUES
  (1, 1, 'Beber agua', 'Tomar 8 vasos de agua al dia', 'Salud', 'Diaria', true, '2026-06-25T12:00:00.000Z'),
  (2, 1, 'Estudiar programacion', 'Repasar React durante 30 minutos', 'Estudio', 'Diaria', true, '2026-06-17T12:00:00.000Z'),
  (3, 2, 'Caminar 30 minutos', 'Salir a caminar despues del trabajo', 'Deporte', 'Diaria', true, '2026-06-19T12:00:00.000Z'),
  (4, 2, 'Leer antes de dormir', 'Leer 15 paginas de un libro', 'Personal', 'Diaria', true, '2026-06-23T12:00:00.000Z'),
  (5, 2, 'Planificar el dia', 'Organizar pendientes y prioridades', 'Trabajo', 'Diaria', true, '2026-06-15T12:00:00.000Z'),
  (6, 2, 'Meditar', 'Respirar y meditar por 10 minutos', 'Salud', 'Diaria', true, '2026-06-28T12:00:00.000Z'),
  (7, 3, 'Practicar ingles', 'Repasar vocabulario y escuchar un podcast', 'Estudio', 'Diaria', true, '2026-06-12T12:00:00.000Z'),
  (8, 3, 'Ejercicios de fuerza', 'Completar una rutina corta en casa', 'Deporte', 'Semanal', true, '2026-06-26T12:00:00.000Z'),
  (9, 3, 'Ordenar escritorio', 'Mantener limpio el espacio de estudio', 'Personal', 'Diaria', true, '2026-06-21T12:00:00.000Z'),
  (10, 3, 'Tomar descansos', 'Hacer pausas breves durante sesiones largas', 'Salud', 'Diaria', true, '2026-06-24T12:00:00.000Z')
ON CONFLICT (id_habito) DO UPDATE SET
  id_usuario = EXCLUDED.id_usuario,
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  categoria = EXCLUDED.categoria,
  frecuencia = EXCLUDED.frecuencia,
  activo = EXCLUDED.activo,
  fecha_creacion = EXCLUDED.fecha_creacion;

INSERT INTO cumplimientos (id_habito, fecha, completado) VALUES
  (2, CURRENT_DATE, true),
  (3, CURRENT_DATE, true),
  (5, CURRENT_DATE, true),
  (7, CURRENT_DATE, true),
  (9, CURRENT_DATE, true)
ON CONFLICT (id_habito, fecha) DO UPDATE SET
  completado = EXCLUDED.completado;
