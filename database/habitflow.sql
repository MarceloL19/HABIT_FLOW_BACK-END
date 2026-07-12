DROP TABLE IF EXISTS cumplimientos;
DROP TABLE IF EXISTS habitos;
DROP TABLE IF EXISTS preferencias;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE preferencias (
  id_preferencia SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  tema VARCHAR(20) DEFAULT 'claro',
  idioma VARCHAR(20) DEFAULT 'es',
  notificaciones BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_preferencias_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE habitos (
  id_habito SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50),
  frecuencia VARCHAR(50),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_habitos_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE cumplimientos (
  id_cumplimiento SERIAL PRIMARY KEY,
  id_habito INT NOT NULL,
  fecha DATE NOT NULL,
  completado BOOLEAN,
  CONSTRAINT uq_cumplimientos_habito_fecha
    UNIQUE (id_habito, fecha),
  CONSTRAINT fk_cumplimientos_habito
    FOREIGN KEY (id_habito)
    REFERENCES habitos(id_habito)
    ON DELETE CASCADE
);

-- Datos de prueba para levantar el proyecto con informacion inicial.
-- La contrasena de los usuarios de prueba es: 123456
INSERT INTO usuarios (id_usuario, nombre, correo, password, fecha_registro) VALUES
  (1, 'Marcelo Loayza', 'marcelo@test.com', '$2a$10$w22/mDOXSCSuY4EQYk8d1.xLUGiUIIn4vNNBWa9r.X1qxRqhNdPkq', CURRENT_TIMESTAMP),
  (2, 'Mariana Torres', 'mariana@test.com', '$2a$10$w22/mDOXSCSuY4EQYk8d1.xLUGiUIIn4vNNBWa9r.X1qxRqhNdPkq', CURRENT_TIMESTAMP),
  (3, 'Carlos Rivas', 'carlos@test.com', '$2a$10$w22/mDOXSCSuY4EQYk8d1.xLUGiUIIn4vNNBWa9r.X1qxRqhNdPkq', CURRENT_TIMESTAMP);

INSERT INTO preferencias (id_preferencia, id_usuario, tema, idioma, notificaciones) VALUES
  (1, 1, 'claro', 'es', TRUE),
  (2, 2, 'oscuro', 'es', TRUE),
  (3, 3, 'claro', 'en', FALSE);

INSERT INTO habitos (id_habito, id_usuario, nombre, descripcion, categoria, frecuencia, activo, fecha_creacion) VALUES
  (1, 1, 'Beber agua', 'Tomar 8 vasos de agua al dia', 'Salud', 'Diaria', TRUE, CURRENT_TIMESTAMP - INTERVAL '15 days'),
  (2, 1, 'Estudiar programacion', 'Repasar React y backend durante 30 minutos', 'Estudio', 'Diaria', TRUE, CURRENT_TIMESTAMP - INTERVAL '12 days'),
  (3, 1, 'Ordenar escritorio', 'Mantener limpio el espacio de estudio', 'Personal', 'Diaria', TRUE, CURRENT_TIMESTAMP - INTERVAL '8 days'),
  (4, 2, 'Caminar 30 minutos', 'Salir a caminar despues del trabajo', 'Deporte', 'Diaria', TRUE, CURRENT_TIMESTAMP - INTERVAL '10 days'),
  (5, 2, 'Leer antes de dormir', 'Leer 15 paginas de un libro', 'Personal', 'Diaria', TRUE, CURRENT_TIMESTAMP - INTERVAL '7 days'),
  (6, 3, 'Practicar ingles', 'Repasar vocabulario y escuchar un podcast', 'Estudio', 'Diaria', TRUE, CURRENT_TIMESTAMP - INTERVAL '14 days'),
  (7, 3, 'Ejercicios de fuerza', 'Completar una rutina corta en casa', 'Deporte', 'Semanal', TRUE, CURRENT_TIMESTAMP - INTERVAL '9 days');

INSERT INTO cumplimientos (id_cumplimiento, id_habito, fecha, completado) VALUES
  (1, 1, CURRENT_DATE, TRUE),
  (2, 1, CURRENT_DATE - 1, TRUE),
  (3, 1, CURRENT_DATE - 2, TRUE),
  (4, 2, CURRENT_DATE, TRUE),
  (5, 2, CURRENT_DATE - 1, TRUE),
  (6, 3, CURRENT_DATE - 1, TRUE),
  (7, 4, CURRENT_DATE, TRUE),
  (8, 4, CURRENT_DATE - 1, TRUE),
  (9, 5, CURRENT_DATE - 2, TRUE),
  (10, 6, CURRENT_DATE, TRUE),
  (11, 6, CURRENT_DATE - 1, TRUE),
  (12, 7, CURRENT_DATE - 3, TRUE);

SELECT setval('usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios));
SELECT setval('preferencias_id_preferencia_seq', (SELECT MAX(id_preferencia) FROM preferencias));
SELECT setval('habitos_id_habito_seq', (SELECT MAX(id_habito) FROM habitos));
SELECT setval('cumplimientos_id_cumplimiento_seq', (SELECT MAX(id_cumplimiento) FROM cumplimientos));
