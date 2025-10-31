# ArenAI Backend

API RESTful construida con TypeScript y Express para interactuar con OpenGauss utilizando SQL puro.

## Requisitos

- Node.js >= 18
- Base de datos OpenGauss/PostgreSQL accesible
- Variables de entorno definidas (ver `.env.example`)

## Instalación

```bash
npm install
```

> Puedes usar `pnpm` o `yarn` si lo prefieres, manteniendo las mismas órdenes.

## Migraciones

Ejecuta los scripts `database/000-initial-schema.sql` y `database/001-arenai.sql` desde el backend con:

```bash
npm run migrate
```

El script aplicará todos los archivos `.sql` de la carpeta `database/` en orden alfanumérico.

## Desarrollo

```bash
npm run dev
```

El servidor se expone en `http://localhost:3000` (configurable vía `PORT`).

## Endpoints Relevantes

- `GET /health` – verificación rápida del servicio.
- `GET /api/institutions` / `POST /api/institutions`
- `GET /api/institutions/:institutionId/sections` / `POST .../sections`
- `GET /api/subjects` / `POST /api/subjects`
- `GET /api/subjects/:subjectId/topics` / `POST .../topics`
- `POST /api/topics/relations` – dependencia entre temas.
- `GET|POST /api/topics/:topicId/resources` – recursos por tema.
- `POST /api/classes` – registra una clase.
- `POST /api/classes/:classId/topics` – asigna temas a la clase.
- `POST /api/classes/:classId/students` – registra participación de estudiantes.
- `POST /api/classes/:classId/topics/scores` – calificaciones por estudiante/tema en una clase.
- `GET /api/students/:userId/progress` – progreso general por tema.
- `POST /api/students/:userId/topics/:topicId/score` – actualiza/crea puntaje acumulado por tema.

Todos los endpoints realizan validación con Zod y ejecutan SQL nativo mediante el cliente `pg`.

## Autenticación

1. Solicita un token JWT enviando `POST /api/auth/login` con:

```json
{
  "identifier": "usuario-o-correo",
  "password": "TuP4ssw0rd@Fuerte"
}
```

2. Usa el token recibido en las demás peticiones:

```
Authorization: Bearer <token>
```

Configura `JWT_SECRET` y `JWT_EXPIRES_IN` en tu `.env` para ajustar la firma y caducidad de los tokens.
