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
> Si realmente necesitas recrear todo desde cero, elimina manualmente las tablas o la base de datos antes de volver a ejecutar `npm run migrate`.
>
> El esquema completo vive ahora en `000-initial-schema.sql`. El archivo `001-arenai.sql` se conserva como migración vacía para mantener compatibilidad con ejecuciones anteriores.

## Configuración de Base de Datos (SSL)

El backend se conecta vía TLS contra MySQL usando los certificados en `backend/cert/`. Asegúrate de definir en `.env`:

```
DB_HOST=34.67.117.207
DB_PORT=3306
DB_NAME=arenaidb
DB_USER=arenaidb
DB_PASSWORD=DAKe5?LNjoZluak+
DB_SSL=true
DB_SSL_CA_PATH=cert/server-ca-arenai.pem
DB_SSL_CERT_PATH=cert/client-cert-arenai.pem
DB_SSL_KEY_PATH=cert/client-key-arenai.pem
```

Los paths pueden ser absolutos o relativos al directorio `backend/`. Si `DB_SSL=true`, todos los archivos deben existir; de lo contrario, la inicialización fallará. Para entornos locales sin TLS basta con poner `DB_SSL=false` y omitir los paths.

## Desarrollo

```bash
npm run dev
```

El servidor se expone en `http://localhost:3002` (configurable vía `PORT`).

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

## Modelo de Datos

- **institution**: catálogo de colegios con promedio global. `section`, `user` y `grade_score_average` apuntan aquí.
- **section**: grupos por institución (ej. “Sección 9A”). Cada sección pertenece a una `institution` y se usa en `class` y `user_section`.
- **subject**: materias principales. `class` y `topic` referencian un `subject`.
- **topic**: temas concretos dentro de una materia. Se relaciona con `topic_father_son_relation`, `topic_resource`, `class_topic`, `class_student_topic` y `student_topic`.
- **topic_father_son_relation**: define dependencias entre temas (padre ↔ hijo) para mapear prerequisitos.
- **topic_resource**: almacena recursos (links, notas, calidad) asociados a un `topic`.
- **user**: entidad central de autenticación (admin, profesor o estudiante). Puede apuntar a una `institution` y se amplía con perfiles.
- **student_profile**: datos adicionales de estudiantes (correo de encargado, score promedio). Los triggers exigen su existencia al inscribirlos en clases.
- **professor_profile**: datos adicionales de profesores (grado que imparten). Los triggers de `class` validan que exista.
- **user_section**: relación N:M entre usuarios y secciones con el rol específico en cada una.
- **class**: registro de cada sesión de clase (profesor, sección, materia, fecha, resúmenes). Se conecta con `class_topic`, `class_student` y `class_student_topic`.
- **class_topic**: lista los temas cubiertos en una clase y almacena un promedio por tema; el trigger asegura que el tema corresponde a la misma materia de la clase.
- **class_student**: participación global de cada estudiante en la clase (coeficiente de interacción, resumen, score).
- **class_student_topic**: calificación por estudiante/tema dentro de la clase (detalle fino por participación).
- **student_topic**: progreso acumulado por estudiante/tema a lo largo del tiempo, independiente de la clase.
- **grade_score_average**: promedio agregado por grado dentro de una institución (opcional para dashboards).

Relaciones importantes:

1. `institution` → `section` → `class`: toda clase pertenece a una sección y, por transitividad, a una institución.
2. `class` requiere un `user` con `professor_profile`; el trigger `trg_class_professor_check_*` lo verifica.
3. Estudiantes (`user` + `student_profile`) se inscriben a clases (`class_student`) y se desglosan por tema (`class_student_topic`); el progreso histórico queda en `student_topic`.
4. `subject` agrupa múltiples `topic` y, a su vez, cada clase se asocia a un `subject`. Los triggers de `class_topic` impiden mezclar temas de otra materia.
5. Los recursos (`topic_resource`) y relaciones (`topic_father_son_relation`) ayudan a enriquecer recomendaciones AI y a mostrar dependencias curriculares.
