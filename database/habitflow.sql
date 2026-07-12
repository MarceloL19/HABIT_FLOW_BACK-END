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
