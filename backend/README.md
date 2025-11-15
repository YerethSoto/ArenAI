# ArenAI Backend

API RESTful construida con TypeScript y Express para interactuar con MySQL utilizando SQL puro.

## Requisitos

- Node.js >= 18
- Base de datos MySQL 8+ accesible
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

El script aplicará todos los archivos `.sql` de la carpeta `database/` en orden alfanumérico. Asegúrate de que los scripts estén adaptados a MySQL antes de ejecutarlos.

> Los scripts fueron escritos de forma idempotente, por lo que puedes volver a correr `npm run migrate` sin vaciar la base de datos. El seed actualiza/crea el usuario `admin` automáticamente si ya existe.
>
> Si realmente necesitas recrear todo desde cero, edita `database/001-arenai.sql` y cambia temporalmente la línea `SET @RESET_SCHEMA := IFNULL(@RESET_SCHEMA, 0);` a `SET @RESET_SCHEMA := 1;` **antes** de ejecutar `npm run migrate`. Mientras esté en `0`, tus datos no se eliminarán.

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
- `GET /api/classes` – listado filtrable por materia, sección o profesor.
- `POST /api/classes` – registra una clase.
- `POST /api/classes/:classId/topics` – asigna temas a la clase.
- `POST /api/classes/:classId/students` – registra participación de estudiantes.
- `POST /api/classes/:classId/topics/scores` – calificaciones por estudiante/tema en una clase.
- `GET /api/students/:userId/progress` – progreso general por tema.
- `POST /api/students/:userId/topics/:topicId/score` – actualiza/crea puntaje acumulado por tema.

Todos los endpoints realizan validación con Zod y ejecutan SQL nativo mediante el cliente `mysql2`.

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

## Pruebas con Postman

Se incluyó la colección `backend/postman/arenai-api.postman_collection.json` con todos los endpoints.

1. Importa el archivo en Postman y ajusta la variable `baseUrl` si el backend corre en otro host/puerto.
2. Ejecuta `POST /api/auth/login` (usa el usuario sembrado `admin` / `ArenAIAdmin123` tras correr `npm run migrate`). El script de la colección guardará automáticamente el token y el `authUserId` para reutilizarlos.
3. Las peticiones que crean entidades guardan los IDs resultantes en variables (`institutionId`, `sectionId`, `subjectId`, `topicId`, etc.) que luego se usan en rutas dependientes.
4. Para los campos que requieren un estudiante real (`studentUserId`) crea primero un usuario con perfil de estudiante en la base de datos y escribe su ID en la variable correspondiente antes de ejecutar esos requests.
5. El flujo recomendado es: crear institución (institution) → sección (section) → materia (subject) → temas (topics) → recursos/relaciones (resources/relations) → clase (class) → asignaciones y métricas (assignments/metrics) → endpoints de estudiante (student endpoints).

Con esto puedes recorrer toda la API en orden desde Postman sin tener que armar cada request manualmente.



DB:

arenaidb / DAKe5?LNjoZluak+
