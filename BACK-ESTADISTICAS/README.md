# Backend Estadisticas Habit Flow

Backend Express + PostgreSQL para alimentar `Estadisticas.jsx`.

## Configuracion

1. Crear una base de datos en PostgreSQL/pgAdmin llamada `habitflow_db`.
2. Copiar `.env.example` como `.env` y ajustar usuario/password.
3. Ejecutar en pgAdmin los scripts:
   - `sql/schema.sql`
   - `sql/seed.sql`
4. Instalar dependencias y levantar:

```bash
npm install
npm run dev
```

Endpoint principal:

```text
GET http://localhost:3000/api/estadisticas/:idUsuario
```
