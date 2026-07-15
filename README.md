# HabitFlow Backend

Backend para la parte de autenticacion, perfil y preferencias del proyecto HabitFlow.

Este backend usa Node.js, Express y PostgreSQL. Para esta entrega no se usa JWT: la sesion activa se maneja desde el frontend guardando el usuario retornado por el login.

## Instalacion

```bash
npm install
```

## Base de datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE habitflow_db;
```

La estructura principal de la base de datos se puede crear con migraciones de Sequelize:

```bash
npm run db:migrate
```

Para cargar datos de prueba:

```bash
npm run db:seed
```

Las migraciones crean las tablas:

- usuarios
- preferencias
- habitos
- cumplimientos

Si se necesita revertir la base de datos durante pruebas locales:

```bash
npm run db:seed:undo
npm run db:migrate:undo
```

Tambien se mantiene el script SQL manual como referencia:

```text
database/habitflow.sql
```

## Variables de entorno

Crear un archivo `.env` usando como base `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=habitflow_db
DB_PORT=5432
```

## Levantar backend

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Ruta de prueba:

```http
GET http://localhost:3000/
```

## Endpoints disponibles

### Registrar usuario

```http
POST /api/auth/registro
```

Body:

```json
{
  "nombre": "Marcelo Loayza",
  "correo": "marcelo@correo.com",
  "password": "123456"
}
```

### Iniciar sesion

```http
POST /api/auth/login
```

Body:

```json
{
  "correo": "marcelo@correo.com",
  "password": "123456"
}
```

### Obtener perfil

```http
GET /api/usuarios/:id
```

Ejemplo:

```http
GET /api/usuarios/1
```

### Actualizar perfil

```http
PUT /api/usuarios/:id
```

Body:

```json
{
  "nombre": "Marcelo Franco Loayza",
  "correo": "marcelo.nuevo@correo.com"
}
```

### Actualizar preferencias

```http
PUT /api/usuarios/:id/preferencias
```

Body:

```json
{
  "tema": "oscuro",
  "idioma": "es",
  "notificaciones": false
}
```

## Conexion con el frontend React

- `Registro.jsx` debe llamar a `POST /api/auth/registro`.
- `Login.jsx` debe llamar a `POST /api/auth/login`.
- `App.jsx` guarda el usuario retornado en localStorage con la clave `usuarioActivo`.
- `Perfil.jsx` usa `GET /api/usuarios/:id` para cargar el perfil.
- `Perfil.jsx` usa `PUT /api/usuarios/:id` para editar nombre y correo.
- `Perfil.jsx` usa `PUT /api/usuarios/:id/preferencias` para editar tema, idioma y notificaciones.

## Notas

- La contrasena se guarda encriptada con `bcryptjs`.
- Ninguna respuesta devuelve la contrasena.
- Las preferencias se crean automaticamente cuando se registra un usuario.
