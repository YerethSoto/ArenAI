# 📘 Especificación Técnica de la Base de Datos Académica

## 🧩 1. Propósito General

La base de datos está diseñada para gestionar la información académica de instituciones educativas, incluyendo usuarios (profesores, estudiantes, administradores), clases, materias, temas, recursos y métricas de rendimiento. Su estructura permite tanto la operación diaria (registro de clases, usuarios y secciones) como el análisis de datos (rendimiento por tema, clase o institución).

---

## 🏫 2. Entidades Principales

### **institution**

Representa una institución educativa (colegio, universidad, academia).

**Campos:**

* `id_institution`: Identificador único.
* `name_institution`: Nombre de la institución (único).
* `score_average`: Promedio general de rendimiento académico.

**Uso:** Referencia para secciones, usuarios y reportes.

---

### **section**

Representa una sección o grupo dentro de una institución (por ejemplo, "7°A").

**Campos:**

* `id_section`: Identificador único.
* `name`: Nombre de la sección.
* `grade`: Nivel o grado académico.
* `id_institution`: FK a `institution`.

**Relaciones:**

* Una institución puede tener muchas secciones.
* Asociada a usuarios (profesores/estudiantes) mediante `user_section`.

---

### **subject**

Define una materia o asignatura impartida.

**Campos:**

* `id_subject`: Identificador único.
* `name_subject`: Nombre de la materia (único).

**Relaciones:**

* Una materia puede tener muchos temas (`topic`).
* Cada clase pertenece a una materia.

---

### **topic**

Representa un tema o unidad de estudio dentro de una materia.

**Campos:**

* `id_topic`: Identificador único.
* `name`: Nombre del tema.
* `id_subject`: FK a `subject`.
* `description`: Descripción o resumen del tema.

**Relaciones:**

* Puede tener recursos (`topic_resource`).
* Puede tener relaciones jerárquicas con otros temas (`topic_father_son_relation`).

---

### **topic_father_son_relation**

Permite modelar relaciones jerárquicas entre temas (p. ej., un tema base y uno avanzado).

**Campos:**

* `id_topic_father_son_relation`: Identificador único.
* `id_topic_father`: Tema padre.
* `id_topic_son`: Tema hijo.
* `correlation_coefficient`: Valor numérico que mide la dependencia entre ambos temas.

**Uso:** Define dependencias conceptuales para recomendaciones o rutas de aprendizaje.

---

### **topic_resource**

Asocia recursos didácticos a cada tema.

**Campos:**

* `id_topic_resource`: Identificador único.
* `id_topic`: FK a `topic`.
* `resource_source`: URL o ubicación del recurso.
* `description`: Descripción del recurso.
* `resource_quality`: Evaluación de la calidad del recurso.

---

## 👥 3. Usuarios y Roles

### **user**

Entidad base que representa a toda persona en el sistema (profesores, estudiantes, administradores, etc.).

**Campos:**

* `id_user`: Identificador único.
* `username`: Usuario único.
* `email`: Correo electrónico.
* `password_hash`: Hash seguro de la contraseña.
* `name`, `last_name`, `phone_number`: Datos personales.
* `id_institution`: FK a `institution`.
* `role`: Rol principal (por ejemplo: `student`, `professor`, `admin`).

---

### **student_profile**

Contiene información específica de los estudiantes.

**Campos:**

* `id_user`: FK a `user` (uno a uno).
* `email_guardian`: Correo del acudiente o responsable.
* `score_average`: Promedio individual del estudiante.

---

### **professor_profile**

Contiene información específica de los profesores.

**Campos:**

* `id_user`: FK a `user` (uno a uno).
* `grade`: Nivel o categoría del profesor.

---

### **user_section**

Relación N:M entre usuarios y secciones.

**Campos:**

* `id_user`: FK a `user`.
* `id_section`: FK a `section`.
* `role_in_section`: Define el rol del usuario en la sección (`student`, `professor`, `assistant`, etc.).

**Uso:** Permite que un usuario pertenezca a múltiples secciones.

---

## 📚 4. Clases y Temas

### **class**

Representa una clase o sesión impartida.

**Campos:**

* `id_class`: Identificador único.
* `id_professor`: FK a `user` (debe tener perfil de profesor).
* `name_class`: Nombre o título de la clase.
* `id_subject`: FK a `subject`.
* `id_section`: FK a `section`.
* `fecha`: Fecha de la clase.
* `ai_summary`: Resumen generado por IA (opcional).
* `current_questions_summary`: Preguntas o temas actuales tratados.
* `score_average`: Promedio de rendimiento en la clase.

**Reglas:**

* Un trigger valida que el `id_professor` pertenezca a `professor_profile`.

---

### **class_topic**

Relaciona una clase con los temas abordados en ella (N:M).

**Campos:**

* `id_class_topic`: Identificador único.
* `id_class`: FK a `class`.
* `id_topic`: FK a `topic`.
* `score_average`: Promedio de rendimiento en ese tema dentro de la clase.

**Reglas:**

* Un trigger asegura que el tema y la clase pertenezcan a la misma materia (`subject`).

---

## 🎯 5. Métricas y Seguimiento

### **class_student**

Registra la participación y rendimiento del estudiante en una clase.

**Campos:**

* `id_class`: FK a `class`.
* `id_user`: FK a `user` (debe tener perfil de estudiante).
* `ai_summary`: Resumen personalizado de la clase (IA).
* `interaction_coefficient`: Nivel de interacción del estudiante.
* `score_average`: Calificación promedio en la clase.

---

### **class_student_topic**

Registra el progreso del estudiante por tema dentro de una clase.

**Campos:**

* `id_class`: FK a `class`.
* `id_topic`: FK a `topic`.
* `id_user`: FK a `user`.
* `score`: Puntaje individual en el tema.
* `ai_summary`: Observaciones o resumen generado automáticamente.

**Reglas:**

* `(id_class, id_topic)` debe existir en `class_topic`.
* `(id_class, id_user)` debe existir en `class_student`.
* Trigger valida que el `id_user` tenga perfil de estudiante.

---

### **student_topic**

Mide el rendimiento histórico del estudiante por tema, sin depender de una clase específica.

**Campos:**

* `id_student_topic`: Identificador único.
* `id_user`: FK a `user`.
* `id_topic`: FK a `topic`.
* `score`: Puntaje promedio global.

**Uso:** Base para reportes longitudinales y analítica de aprendizaje.

---

### **grade_score_average**

Tabla de análisis con promedios de calificación por grado e institución.

**Campos:**

* `id_grade_average`: Identificador único.
* `id_institution`: FK a `institution`.
* `grade`: Nombre del grado o nivel.
* `score`: Promedio general del grado.

**Uso:** Generación de dashboards o reportes institucionales.

---

## ⚙️ 6. Reglas y Triggers

### **enforce_same_subject_for_class_topic**

Evita inconsistencias al insertar temas de una materia distinta a la de la clase.

### **ensure_user_is_professor**

Evita asignar como profesor a un usuario sin perfil docente.

### **ensure_user_is_student**

Evita registrar métricas de clase o tema para usuarios sin perfil de estudiante.

---

## 📈 7. Consideraciones Técnicas

* **Motor:** openGauss (compatible con PostgreSQL)
* **Integridad:** Llaves foráneas y triggers aseguran consistencia.
* **Escalabilidad:** El modelo soporta múltiples instituciones, usuarios con roles combinados y analítica avanzada.
* **Seguridad:** Contraseñas almacenadas como `password_hash` (bcrypt, Argon2, etc.).
* **Indices:**

  * Búsqueda rápida por `id_subject`, `id_section`, `id_user`, `id_topic`.
  * Relaciones N:M optimizadas con índices compuestos.

---

## 🧾 8. Flujo Conceptual

1. **Institución → Sección → Usuario** (estructura académica).
2. **Materia → Tema → Clase → Clase_Tema** (contenido académico).
3. **Clase → Clase_Estudiante → Clase_Estudiante_Tema** (participación y rendimiento).
4. **Student_Topic** (rendimiento histórico individual).
5. **Triggers** garantizan integridad entre materias, temas y roles.

---

## 🧠 9. Uso para Desarrolladores

* Usar `user` para autenticación y control de acceso.
* Al crear una clase, validar que el `id_professor` tenga perfil docente.
* Para registrar asistencia o rendimiento, insertar primero en `class_student` y luego en `class_student_topic`.
* Para dashboards o reportes: usar `student_topic`, `grade_score_average` y promedios de `class_topic`.

---

**Versión:** 1.0
**Motor:** openGauss
**Fecha:** 2025-10-27
**Autor:** Equipo de Ingeniería (Especificación generada a partir del diseño validado por Marlon Chavarría)
