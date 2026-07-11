CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS preferencias (
  id_preferencia SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  tema VARCHAR(20),
  idioma VARCHAR(20),
  notificaciones BOOLEAN
);

CREATE TABLE IF NOT EXISTS habitos (
  id_habito SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50),
  frecuencia VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cumplimientos (
  id_cumplimiento SERIAL PRIMARY KEY,
  id_habito INT NOT NULL REFERENCES habitos(id_habito) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  completado BOOLEAN DEFAULT true,
  UNIQUE (id_habito, fecha)
);

CREATE INDEX IF NOT EXISTS idx_habitos_id_usuario ON habitos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_cumplimientos_id_habito_fecha ON cumplimientos(id_habito, fecha);
